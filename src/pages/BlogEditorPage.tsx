// src/pages/BlogEditorPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon, Bold, Italic, List, Link2, Type } from 'lucide-react';
import { createPost, updatePost, getPostBySlug, generateSlug, uploadImage } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

const BlogEditorPage: React.FC = () => {
  return (
    <ProtectedRoute requireApproval>
      <BlogEditor />
    </ProtectedRoute>
  );
};

const BlogEditor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = slug && slug !== 'new';

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft' as 'draft' | 'published',
    meta_title: '',
    meta_description: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const post = await getPostBySlug(slug!);
          if (post && post.author_id === user?.id) {
            setFormData({
              title: post.title,
              slug: post.slug,
              content: post.content,
              excerpt: post.excerpt || '',
              featured_image: post.featured_image || '',
              status: post.status,
              meta_title: post.meta_title || '',
              meta_description: post.meta_description || ''
            });
          } else {
            navigate('/blog');
          }
        } catch (error) {
          console.error('Error fetching post:', error);
          navigate('/blog');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [isEditing, slug, user?.id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from title if creating new post
      ...(name === 'title' && !isEditing ? { slug: generateSlug(value) } : {})
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Endast bildfiler är tillåtna');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('Bilden är för stor. Maximal storlek är 50MB.');
      return;
    }

    setImageUploading(true);
    try {
      const imageUrl = await uploadImage(file, user.id);
      setFormData(prev => ({ ...prev, featured_image: imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Fel vid uppladdning av bild';
      alert(errorMessage);
    } finally {
      setImageUploading(false);
      // Clear the input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const insertAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = formData.content;
    
    const newContent = currentContent.substring(0, start) + textToInsert + currentContent.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleSave = async (publishNow = false) => {
    if (!user || !formData.title.trim() || !formData.content.trim()) {
      alert('Titel och innehåll är obligatoriska');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        ...formData,
        status: publishNow ? 'published' as const : formData.status,
        author_id: user.id,
        published_at: publishNow && formData.status === 'draft' ? new Date().toISOString() : undefined
      };

      if (isEditing) {
        const post = await getPostBySlug(slug!);
        if (post) {
          await updatePost(post.id, postData);
        }
      } else {
        await createPost(postData);
      }

      navigate(`/blog/${formData.slug}`);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Fel vid sparande av inlägg');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
      <div className="container-max section-padding py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center text-hemp-600 hover:text-hemp-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till bloggen
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="btn-secondary flex items-center"
            >
              {previewMode ? 'Redigera' : 'Förhandsgranska'}
            </button>
            
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="btn-secondary disabled:opacity-50"
            >
              {saving ? 'Sparar...' : 'Spara utkast'}
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Publicerar...' : 'Publicera'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {previewMode ? (
              <BlogPreview formData={formData} />
            ) : (
              <>
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-hemp-900 mb-2">
                    Titel *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-2xl font-bold border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                    placeholder="Rubrik..."
                  />
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-hemp-900 mb-2">
                    URL-slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                    placeholder="url-vanlig-slug"
                  />
                  <p className="text-xs text-hemp-600 mt-1">
                    Används i URL:en: hampaoasen.se/blog/{formData.slug || 'din-slug'}
                  </p>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-hemp-900 mb-2">
                    Utvald bild
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="featured-image-upload"
                    />
                    <label
                      htmlFor="featured-image-upload"
                      className="inline-flex items-center btn-secondary cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {imageUploading ? 'Laddar upp...' : 'Ladda upp bild'}
                    </label>
                    
                    {formData.featured_image && (
                      <div className="relative">
                        <img
                          src={formData.featured_image}
                          alt="Utvald bild"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <label htmlFor="content-editor" className="block text-sm font-medium text-hemp-900 mb-2">
                    Innehåll *
                  </label>
                  
                  {/* Toolbar */}
                  <div className="border border-hemp-200 rounded-t-lg bg-hemp-50 p-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => insertAtCursor('**')}
                      className="p-2 hover:bg-hemp-100 rounded text-hemp-700"
                      title="Fet text"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('*')}
                      className="p-2 hover:bg-hemp-100 rounded text-hemp-700"
                      title="Kursiv text"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('\n## ')}
                      className="p-2 hover:bg-hemp-100 rounded text-hemp-700"
                      title="Rubrik"
                    >
                      <Type className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('\n- ')}
                      className="p-2 hover:bg-hemp-100 rounded text-hemp-700"
                      title="Lista"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('[länktext](https://example.com)')}
                      className="p-2 hover:bg-hemp-100 rounded text-hemp-700"
                      title="Länk"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('![alt text](bildurl)')}
                      className="p-2 hover:bg-hemp-100 rounded text-hemp-700"
                      title="Bild"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    id="content-editor"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={20}
                    className="w-full px-4 py-3 border-l border-r border-b border-hemp-200 rounded-b-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                    placeholder="Skriv ditt innehåll här... Du kan använda Markdown-formatering."
                  />
                  
                  <div className="mt-2 text-xs text-hemp-600">
                    <p>Tips: Använd Markdown för formatering:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>**fet text** för <strong>fet text</strong></li>
                      <li>*kursiv text* för <em>kursiv text</em></li>
                      <li>## Rubrik för rubriker</li>
                      <li>- Lista för punktlistor</li>
                      <li>[länktext](url) för länkar</li>
                    </ul>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-hemp-900 mb-2">
                    Sammanfattning
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                    placeholder="En kort sammanfattning som visas i blogglistan..."
                  />
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SEO Settings */}
            <div className="bg-white p-6 rounded-lg border border-hemp-200">
              <h3 className="text-lg font-semibold text-hemp-900 mb-4">SEO-inställningar</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="meta_title" className="block text-sm font-medium text-hemp-900 mb-2">
                    SEO-titel
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-hemp-200 rounded focus:ring-2 focus:ring-hemp-500 focus:border-transparent"
                    placeholder="Optimerad titel för sökmotorer"
                  />
                </div>

                <div>
                  <label htmlFor="meta_description" className="block text-sm font-medium text-hemp-900 mb-2">
                    SEO-beskrivning
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-hemp-200 rounded focus:ring-2 focus:ring-hemp-500 focus:border-transparent"
                    placeholder="Beskrivning som visas i sökresultat"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white p-6 rounded-lg border border-hemp-200">
              <h3 className="text-lg font-semibold text-hemp-900 mb-4">Status</h3>
              
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-hemp-200 rounded focus:ring-2 focus:ring-hemp-500 focus:border-transparent"
              >
                <option value="draft">Utkast</option>
                <option value="published">Publicerad</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preview Component
interface BlogPreviewProps {
  formData: any;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ formData }) => {
  // Simple markdown to HTML converter
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br />')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  };

  return (
    <div className="bg-white p-8 rounded-lg border border-hemp-200">
      <h1 className="text-3xl font-bold text-hemp-900 mb-4">{formData.title || 'Titel'}</h1>
      
      {formData.featured_image && (
        <img
          src={formData.featured_image}
          alt={formData.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}
      
      {formData.excerpt && (
        <p className="text-lg text-hemp-700 mb-6 italic">{formData.excerpt}</p>
      )}
      
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: markdownToHtml(formData.content || 'Innehåll kommer här...') 
        }}
      />
    </div>
  );
};

export default BlogEditorPage;