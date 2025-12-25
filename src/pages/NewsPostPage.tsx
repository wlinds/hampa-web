// src/pages/NewsPostPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Import types and functions from firebase
import type { BlogPost } from '../lib/firebase';
import { getPostBySlug, deletePost, formatDate } from '../lib/firebase';

// Import new utilities
import { markdownToHtml } from '../utils/markdown';
import { setSEOTags, resetSEOTags, generateBlogPostStructuredData, insertStructuredData } from '../utils/seo';
import { useApiWithRetry } from '../hooks/useApiWithRetry';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';

const NewsPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth(); // user can be null for non-logged in users
  const navigate = useNavigate();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Use the custom hook for API call with retry logic
  const {
    data: post,
    loading,
    error,
    retryCount,
    maxRetries,
    retry
  } = useApiWithRetry<BlogPost | null>(
    async () => {
      if (!slug) throw new Error('Ingen slug angiven');
      return await getPostBySlug(slug);
    },
    [slug], // Re-fetch when slug changes
    { maxRetries: 3 }
  );

  // Memoize author check to prevent unnecessary re-renders
  // Only return true if user is logged in AND is the author
  const isAuthor = useMemo(() => {
    if (!user?.id || !post?.author_id) return false;
    return user.id === post.author_id;
  }, [user?.id, post?.author_id]);

  // Memoized markdown to HTML converter to prevent re-computation
  const htmlContent = useMemo(() => {
    if (!post?.content) return '';
    return markdownToHtml(post.content);
  }, [post?.content]);

  // Set SEO and structured data when post loads
  useEffect(() => {
    if (!post) return;

    // Set SEO meta tags
    const seoData = {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      image: post.featured_image || undefined,
      url: `https://hampaoasen.se/nyheter/${post.slug}`,
      type: 'article' as const,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      author: post.author?.full_name || post.author?.email || 'Hampaoasen'
    };

    setSEOTags(seoData);

    // Add structured data
    if (post.published_at) {
      const structuredData = generateBlogPostStructuredData({
        title: post.title,
        description: post.excerpt || seoData.description,
        author: seoData.author!,
        publishedDate: post.published_at,
        modifiedDate: post.updated_at,
        image: post.featured_image || undefined,
        url: seoData.url
      });

      insertStructuredData(structuredData);
    }

    // Cleanup function to reset SEO tags
    return () => {
      resetSEOTags();
    };
  }, [post]);

  const handleDelete = async () => {
    if (!post || !user) return; // Ensure user is logged in

    setDeleting(true);
    try {
      await deletePost(post.id);
      navigate('/nyheter');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Fel vid borttagning av nyhet');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Error state with retry option
  if (error && !loading) {
    return (
      <ErrorDisplay
        title="Problem med att ladda nyheten"
        message={error}
        onRetry={retry}
        retryLoading={loading}
        retryCount={retryCount}
        maxRetries={maxRetries}
        backTo="/nyheter"
        backText="Tillbaka till nyheterna"
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
        <LoadingSkeleton type="post" />
      </div>
    );
  }

  // Post not found
  if (!post) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
        <div className="container-max section-padding py-20">
          <BackButton to="/nyheter" className="mb-8">
            Tillbaka till nyheterna
          </BackButton>

          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-hemp-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-hemp-900 mb-2">
              Nyheten hittades inte
            </h1>
            <p className="text-hemp-600 mb-6">
              Den nyhet du letar efter finns inte eller har tagits bort.
            </p>
            <Button as="a" href="/nyheter">
              Tillbaka till nyheterna
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
      <article className="container-max section-padding py-20">
        {/* Back Button */}
        <BackButton to="/nyheter" className="mb-8">
          Tillbaka till nyheterna
        </BackButton>

        {/* Header */}
        <header className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-hemp-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-hemp-600 mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>{post.published_at ? formatDate(post.published_at) : 'Ej publicerad'}</span>
            </div>
            {post.author && (
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{post.author.full_name || post.author.email}</span>
              </div>
            )}
          </div>

          {/* Author Actions - Only show if user is logged in and is the author */}
          {isAuthor && (
            <div className="flex items-center space-x-4 mb-6">
              <Button
                as="a"
                href={`/nyheter/${post.slug}/edit`}
                variant="secondary"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Redigera
              </Button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Ta bort
              </button>
            </div>
          )}

          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative rounded-2xl overflow-hidden shadow-lg mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
                loading="eager"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-lg max-w-none prose-hemp"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Call to Action for non-logged in users */}
        {!user && (
          <div className="max-w-4xl mx-auto mt-12 p-6 bg-hemp-50 border border-hemp-200 rounded-xl">
            <h3 className="text-lg font-semibold text-hemp-900 mb-2">
              Gillade du den har nyheten?
            </h3>
            <p className="text-hemp-700 mb-4">
              Kontakta oss for att fa tillgang till var nyhetsplattform och dela dina kunskaper om hampa, biologisk mangfald och hallbar odling.
            </p>
            <Button
              variant="secondary"
              size="sm"
              as="a"
              href="/#contact"
            >
              Kontakta oss
            </Button>
          </div>
        )}

        {/* Delete Confirmation Modal - Only available for authors */}
        {showDeleteConfirm && isAuthor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">
                Ta bort nyhet
              </h3>
              <p className="text-gray-600 mb-6">
                Ar du saker pa att du vill ta bort denna nyhet? Denna atgard kan inte angras.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="secondary"
                  disabled={deleting}
                  className="flex-1"
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleDelete}
                  loading={deleting}
                  variant="danger"
                  className="flex-1"
                >
                  Ta bort
                </Button>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default NewsPostPage;
