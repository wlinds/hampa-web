// src/pages/BlogListPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Edit, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { BlogPost, getPublishedPosts, formatDate } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const BlogListPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Memoize user check to prevent unnecessary re-renders
  const canCreatePosts = useMemo(() => 
    user?.profile?.approved, 
    [user?.profile?.approved]
  );

  // Retry logic for failed requests
  const fetchPosts = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError('');
      
      console.log('Fetching published posts...');
      const publishedPosts = await getPublishedPosts();
      console.log('Posts loaded successfully:', publishedPosts.length);
      
      setPosts(publishedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ett oväntat fel uppstod vid hämtning av blogginlägg';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Retry mechanism with exponential backoff
  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    // Exponential backoff: 1s, 2s, 4s, 8s
    const delay = Math.min(1000 * Math.pow(2, newRetryCount - 1), 8000);
    
    setTimeout(() => {
      fetchPosts(true);
    }, delay);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Error state with retry option
  if (error && !loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
        <div className="container-max section-padding py-20">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-hemp-900 mb-2">
              Problem med att ladda bloggen
            </h2>
            <p className="text-hemp-600 mb-6">
              {error}
            </p>
            <button
              onClick={handleRetry}
              disabled={loading}
              className="btn-primary inline-flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Försöker igen...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Försök igen
                </>
              )}
            </button>
            {retryCount > 0 && (
              <p className="text-xs text-hemp-500 mt-2">
                Försök {retryCount} av 5
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Better loading state
  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
        <div className="container-max section-padding py-20">
          {/* Header skeleton */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="h-12 bg-hemp-100 rounded-lg mb-6 animate-pulse"></div>
            <div className="h-6 bg-hemp-100 rounded-lg mb-4 animate-pulse"></div>
            <div className="h-6 bg-hemp-100 rounded-lg w-3/4 mx-auto animate-pulse"></div>
          </div>
          
          {/* Posts skeleton */}
          <div className="grid lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-hemp-100 overflow-hidden">
                <div className="h-48 bg-hemp-100 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-hemp-100 rounded mb-3 animate-pulse"></div>
                  <div className="h-8 bg-hemp-100 rounded mb-3 animate-pulse"></div>
                  <div className="h-4 bg-hemp-100 rounded mb-4 animate-pulse"></div>
                  <div className="h-4 bg-hemp-100 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
      <div className="container-max section-padding py-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-hemp-900 mb-6">
            Hampaoasens Blogg
          </h1>
          <p className="text-xl text-hemp-700 leading-relaxed">
            Läs om hampa, biologisk mångfald och hållbar odling. Här delar vi kunskap, 
            tips och nyheter från världen av hampakultivering.
          </p>
          
          {canCreatePosts && (
            <Link
              to="/blog/new"
              className="inline-flex items-center mt-6 btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Skriv nytt inlägg
            </Link>
          )}
        </div>

        {/* Blog Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-hemp-900 mb-2">
              Inga blogginlägg än
            </h3>
            <p className="text-hemp-600">
              Första blogginlägget kommer snart!
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {posts.map((post, index) => (
              <BlogPostCard 
                key={post.id} 
                post={post} 
                featured={index === 0}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}

        {/* Refresh button for manual reload */}
        {posts.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => fetchPosts(true)}
              disabled={loading}
              className="text-hemp-600 hover:text-hemp-800 text-sm font-medium disabled:opacity-50 inline-flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Uppdaterar...' : 'Uppdatera'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Memoized blog post card to prevent unnecessary re-renders
interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
  currentUserId?: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = React.memo(({ 
  post, 
  featured = false, 
  currentUserId 
}) => {
  const isAuthor = currentUserId === post.author_id;

  return (
    <article className={`
      bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-hemp-100 overflow-hidden group
      ${featured ? 'lg:col-span-2' : ''}
    `}>
      {/* Featured Image */}
      {post.featured_image && (
        <div className={`
          relative overflow-hidden
          ${featured ? 'h-64 md:h-80' : 'h-48'}
        `}>
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading={featured ? 'eager' : 'lazy'}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-6">
        {/* Meta */}
        <div className="flex items-center space-x-4 text-sm text-hemp-600 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.published_at!)}</span>
          </div>
          {post.author && (
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{post.author.full_name || post.author.email}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className={`
          font-bold text-hemp-900 mb-3 line-clamp-2
          ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}
        `}>
          <Link 
            to={`/blog/${post.slug}`}
            className="hover:text-hemp-700 transition-colors duration-200"
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className={`
            text-hemp-700 leading-relaxed mb-4
            ${featured ? 'text-lg line-clamp-3' : 'line-clamp-2'}
          `}>
            {post.excerpt}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/blog/${post.slug}`}
            className="inline-flex items-center text-hemp-600 hover:text-hemp-800 font-medium transition-colors duration-200"
          >
            Läs mer
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>

          {isAuthor && (
            <Link
              to={`/blog/${post.slug}/edit`}
              className="inline-flex items-center text-hemp-600 hover:text-hemp-800 text-sm"
            >
              <Edit className="w-4 h-4 mr-1" />
              Redigera
            </Link>
          )}
        </div>
      </div>
    </article>
  );
});

BlogPostCard.displayName = 'BlogPostCard';

export default BlogListPage;