// src/pages/BlogPostPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Edit, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Import types and functions from firebase
import type { BlogPost } from '../lib/firebase';
import { getPostBySlug, deletePost, formatDate } from '../lib/firebase';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Memoize author check to prevent unnecessary re-renders
  const isAuthor = useMemo(() => {
    if (!user?.id || !post?.author_id) return false;
    return user.id === post.author_id;
  }, [user?.id, post?.author_id]);

  // Retry logic for failed requests
  const fetchPost = async (isRetry = false) => {
    if (!slug) {
      setError('Ingen slug angiven');
      setLoading(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError('');
      
      console.log('🔄 Fetching post by slug:', slug);
      const blogPost = await getPostBySlug(slug);
      
      if (!blogPost) {
        console.log('Post not found');
        setPost(null);
      } else {
        console.log('Post loaded successfully:', blogPost.title);
        setPost(blogPost);
        
        // Set SEO meta tags
        if (blogPost.meta_title) {
          document.title = blogPost.meta_title;
        } else {
          document.title = `${blogPost.title} - Hampaoasen`;
        }
        
        if (blogPost.meta_description) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', blogPost.meta_description);
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ett oväntat fel uppstod vid hämtning av blogginlägget';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Retry mechanism
  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    const delay = Math.min(1000 * Math.pow(2, newRetryCount - 1), 8000);
    
    setTimeout(() => {
      fetchPost(true);
    }, delay);
  };

  useEffect(() => {
    fetchPost();
    
    // Cleanup function to reset document title
    return () => {
      document.title = 'Hampaoasen - Hampa & Biologisk Mångfald';
    };
  }, [slug]);

  const handleDelete = async () => {
    if (!post) return;
    
    setDeleting(true);
    try {
      await deletePost(post.id);
      navigate('/blog');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Fel vid borttagning av inlägg');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Memoized markdown to HTML converter to prevent re-computation
  const htmlContent = useMemo(() => {
    if (!post?.content) return '';
    
    const markdownToHtml = (markdown: string) => {
      return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" loading="lazy" />')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/\n/g, '<br />')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    };

    return markdownToHtml(post.content);
  }, [post?.content]);

  // Error state with retry option
  if (error && !loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
        <div className="container-max section-padding py-20">
          <Link
            to="/blog"
            className="inline-flex items-center text-hemp-600 hover:text-hemp-800 mb-8 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till bloggen
          </Link>
          
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-hemp-900 mb-2">
              Problem med att ladda blogginlägget
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
          </div>
        </div>
      </div>
    );
  }

  // Better loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
        <article className="container-max section-padding py-20">
          <div className="h-6 w-32 bg-hemp-100 rounded mb-8 animate-pulse"></div>
          
          <header className="max-w-4xl mx-auto mb-12">
            <div className="h-12 bg-hemp-100 rounded-lg mb-6 animate-pulse"></div>
            <div className="h-4 w-64 bg-hemp-100 rounded mb-6 animate-pulse"></div>
            <div className="h-64 md:h-96 bg-hemp-100 rounded-2xl animate-pulse"></div>
          </header>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-hemp-100 rounded animate-pulse"></div>
            ))}
          </div>
        </article>
      </div>
    );
  }

  // Post not found
  if (!post) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
        <div className="container-max section-padding py-20">
          <Link
            to="/blog"
            className="inline-flex items-center text-hemp-600 hover:text-hemp-800 mb-8 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till bloggen
          </Link>
          
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-hemp-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-hemp-900 mb-2">
              Blogginlägg hittades inte
            </h1>
            <p className="text-hemp-600 mb-6">
              Det blogginlägg du letar efter finns inte eller har tagits bort.
            </p>
            <Link to="/blog" className="btn-primary">
              Tillbaka till bloggen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
      <article className="container-max section-padding py-20">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center text-hemp-600 hover:text-hemp-800 mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till bloggen
        </Link>

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

          {/* Author Actions */}
          {isAuthor && (
            <div className="flex items-center space-x-4 mb-6">
              <Link
                to={`/blog/${post.slug}/edit`}
                className="inline-flex items-center btn-secondary text-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Redigera
              </Link>
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">
                Ta bort blogginlägg
              </h3>
              <p className="text-gray-600 mb-6">
                Är du säker på att du vill ta bort detta blogginlägg? Denna åtgärd kan inte ångras.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                  disabled={deleting}
                >
                  Avbryt
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {deleting ? 'Tar bort...' : 'Ta bort'}
                </button>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogPostPage;