// src/pages/NewsListPage.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, User, Plus, Edit, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Import types and functions from firebase
import type { BlogPost } from '../lib/firebase';
import { getPublishedPosts, getUserPosts, formatDate } from '../lib/firebase';

// Import new utilities
import { generateExcerpt, calculateReadingTime } from '../utils/markdown';
import { useApiWithRetry } from '../hooks/useApiWithRetry';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { Button } from '../components/ui/Button';

const NewsListPage: React.FC = () => {
  const { user } = useAuth();
  const [showUserPosts, setShowUserPosts] = useState(false);

  // Reset to public view when user logs out
  useEffect(() => {
    if (!user) {
      setShowUserPosts(false);
    }
  }, [user]);

  // Fetch published posts for public view
  const {
    data: publishedPosts,
    loading: publishedLoading,
    error: publishedError,
    retryCount: publishedRetryCount,
    maxRetries: publishedMaxRetries,
    retry: retryPublished
  } = useApiWithRetry<BlogPost[]>(
    async () => {
      return await getPublishedPosts();
    },
    [], // No dependencies, fetch once
    { maxRetries: 3 }
  );

  // Fetch user posts if logged in and showing user posts
  const {
    data: userPosts,
    loading: userLoading,
    error: userError,
    retry: retryUser
  } = useApiWithRetry<any[]>(
    async () => {
      if (!user?.id || !showUserPosts) return [];
      return await getUserPosts(user.id);
    },
    [user?.id, showUserPosts], // Re-fetch when user changes or when switching views
    { maxRetries: 3 }
  );

  const posts = showUserPosts && user ? userPosts : publishedPosts;
  const loading = showUserPosts && user ? userLoading : publishedLoading;
  const error = showUserPosts && user ? userError : publishedError;

  // Error state with retry option
  if (error && !loading) {
    // Handle specific Firebase permission errors
    const isPermissionError = error.includes('permissions') || error.includes('permission-denied');

    if (isPermissionError && !user) {
      return (
        <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
          <div className="container-max section-padding py-20">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-hemp-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-8 h-8 text-hemp-600" />
              </div>
              <h2 className="text-xl font-semibold text-hemp-900 mb-2">
                Nyheter kommer snart
              </h2>
              <p className="text-hemp-600 mb-6">
                Vi arbetar pa att gora vara nyheter tillgangliga for alla besokare.
                Under tiden kan du kontakta oss for mer information om vara tjanster.
              </p>
              <Button
                as="a"
                href="/#contact"
                variant="primary"
              >
                Kontakta oss
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <ErrorDisplay
        title="Problem med att ladda nyheterna"
        message={error}
        onRetry={showUserPosts && user ? retryUser : retryPublished}
        retryLoading={loading}
        retryCount={showUserPosts && user ? 0 : publishedRetryCount}
        maxRetries={showUserPosts && user ? 3 : publishedMaxRetries}
      />
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
      <div className="container-max section-padding py-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-hemp-900 mb-6 leading-tight">
            {showUserPosts ? 'Mina Nyheter' : 'Nyheter'}
          </h1>
          <p className="text-xl text-hemp-700 leading-relaxed">
            {showUserPosts
              ? 'Hantera dina nyheter och skapa nytt innehall'
              : 'Las om hampa, biologisk mangfald och hallbar odling'
            }
          </p>
        </div>

        {/* Navigation for logged in users */}
        {user && (
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 bg-white p-6 rounded-xl shadow-lg border border-hemp-100">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="flex bg-hemp-100 rounded-lg p-1">
                <button
                  onClick={() => setShowUserPosts(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    !showUserPosts
                      ? 'bg-hemp-600 text-white shadow-sm'
                      : 'text-hemp-600 hover:text-hemp-800'
                  }`}
                >
                  <Eye className="w-4 h-4 mr-2 inline" />
                  Alla nyheter
                </button>
                <button
                  onClick={() => setShowUserPosts(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    showUserPosts
                      ? 'bg-hemp-600 text-white shadow-sm'
                      : 'text-hemp-600 hover:text-hemp-800'
                  }`}
                >
                  <Edit className="w-4 h-4 mr-2 inline" />
                  Mina nyheter
                </button>
              </div>
            </div>

            {user.profile?.approved && (
              <Button
                as="a"
                href="/nyheter/new"
                variant="primary"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ny nyhet
              </Button>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <LoadingSkeleton type="post-list" />
        )}

        {/* Posts Grid */}
        {!loading && posts && posts.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {posts.map((post: any, index: number) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-hemp-100 overflow-hidden group"
              >
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading={index < 2 ? "eager" : "lazy"}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-hemp-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {post.published_at
                          ? formatDate(post.published_at)
                          : `Uppdaterad ${formatDate(post.updated_at)}`
                        }
                      </span>
                    </div>
                    {(post.author || (!showUserPosts && 'Hampaoasen')) && (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>
                          {post.author?.full_name || post.author?.email || 'Hampaoasen'}
                        </span>
                      </div>
                    )}
                    {showUserPosts && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? 'Publicerad' : 'Utkast'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-hemp-900 mb-3 group-hover:text-hemp-700 transition-colors duration-200 line-clamp-2">
                    <a href={`/nyheter/${post.slug}`} className="hover:underline">
                      {post.title}
                    </a>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-hemp-600 mb-4 line-clamp-3">
                    {post.excerpt || (post.content ? generateExcerpt(post.content) : 'Läs mer...')}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-hemp-500">
                      {post.content && `${calculateReadingTime(post.content)} min lasning`}
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`/nyheter/${post.slug}`}
                        className="text-hemp-600 hover:text-hemp-800 text-sm font-medium transition-colors duration-200"
                      >
                        Läs mer
                      </a>
                      {showUserPosts && user?.id === post.author_id && (
                        <a
                          href={`/nyheter/${post.slug}/edit`}
                          className="text-hemp-600 hover:text-hemp-800 text-sm font-medium transition-colors duration-200"
                        >
                          Redigera
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && posts && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-hemp-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="w-8 h-8 text-hemp-600" />
            </div>
            <h3 className="text-xl font-semibold text-hemp-900 mb-2">
              {showUserPosts ? 'Inga nyheter an' : 'Inga nyheter hittades'}
            </h3>
            <p className="text-hemp-600 mb-6">
              {showUserPosts
                ? 'Du har inte skrivit nagra nyheter an. Skapa din forsta nyhet!'
                : 'Det finns inga publicerade nyheter for tillfallet.'
              }
            </p>
            {showUserPosts && user?.profile?.approved && (
              <Button
                as="a"
                href="/nyheter/new"
                variant="primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Skriv din forsta nyhet
              </Button>
            )}
          </div>
        )}

        {/* Call to Action for non-logged in users */}
        {!user && !loading && (
          <div className="mt-16 p-8 bg-gradient-to-r from-hemp-600 to-hemp-700 rounded-2xl text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              Vill du ocksa skriva om hampa och hallbarhet?
            </h3>
            <p className="text-hemp-100 mb-6 max-w-2xl mx-auto">
              Kontakta oss för att fa tillgång till vår nyhetsplattform och dela dina kunskaper om hampa, biologisk mångfald och hållbar odling.
            </p>
            <Button
              variant="secondary"
              className="bg-white text-hemp-700 hover:bg-hemp-50"
              as="a"
              href="/#contact"
            >
              Kontakta oss
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsListPage;
