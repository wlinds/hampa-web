// src/pages/BlogListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Edit, Plus } from 'lucide-react';
import { BlogPost, getPublishedPosts, formatDate } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const BlogListPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const publishedPosts = await getPublishedPosts();
        setPosts(publishedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
          
          {user?.profile?.approved && (
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
              <BlogPostCard key={post.id} post={post} featured={index === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Blog Post Card Component
interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, featured = false }) => {
  const { user } = useAuth();
  const isAuthor = user?.id === post.author_id;

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
};

export default BlogListPage;