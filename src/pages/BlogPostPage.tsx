// src/pages/BlogPostPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Edit, Trash2, AlertCircle } from 'lucide-react';
import { BlogPost, getPostBySlug, deletePost, formatDate } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        const blogPost = await getPostBySlug(slug);
        setPost(blogPost);
        
        // Set SEO meta tags
        if (blogPost) {
          document.title = blogPost.meta_title || `${blogPost.title} - Hampaoasen`;
          if (blogPost.meta_description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', blogPost.meta_description);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
        <div className="container-max section-padding py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hemp-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
        <div className="container-max section-padding py-20">
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

  const isAuthor = user?.id === post.author_id;

  // Simple markdown to HTML converter
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
              <span>{formatDate(post.published_at!)}</span>
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
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-lg max-w-none prose-hemp"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
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