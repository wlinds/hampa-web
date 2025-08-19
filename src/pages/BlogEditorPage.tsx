// src/pages/BlogEditorPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, Bold, Italic, List, Link2, Type, X } from 'lucide-react';
import { createPost, updatePost, getPostBySlug, generateSlug, uploadImage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { markdownToHtml } from '../utils/markdown';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';

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
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalType, setImageModalType] = useState<'upload' | 'url'>('upload');

  // Reset modal tab when modal closes
  useEffect(() => {
    if (!showImageModal) {
      setImageModalType('upload');
    }
  }, [showImageModal]);

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

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleEmbeddedImageUpload = async (file: File) => {
    if (!user) return;

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
      const imageMarkdown = `![Beskrivning av bild](${imageUrl})`;
      insertAtCursor(imageMarkdown);
      setShowImageModal(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Fel vid uppladdning av bild';
      alert(errorMessage);
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageUrlInsert = (url: string, altText: string = 'Beskrivning av bild') => {
    if (!url.trim()) {
      alert('Ange en giltig bild-URL');
      return;
    }
    const imageMarkdown = `![${altText}](${url})`;
    insertAtCursor(imageMarkdown);
    setShowImageModal(false);
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
          <LoadingSkeleton type="post" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
      <div className="container-max section-padding py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <BackButton to="/blog">
            Tillbaka till bloggen
          </BackButton>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              variant="secondary"
            >
              {previewMode ? 'Redigera' : 'Förhandsgranska'}
            </Button>
            
            <Button
              onClick={() => handleSave(false)}
              loading={saving}
              variant="secondary"
            >
              Spara utkast
            </Button>

            <Button
              onClick={() => handleSave(true)}
              loading={saving}
              variant="primary"
            >
              Publicera
            </Button>
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
                      onChange={handleFeaturedImageUpload}
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
                    
                    {/* Enhanced Image Button with Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        className="p-2 hover:bg-hemp-100 rounded text-hemp-700"
                        title="Lägg till bild"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </div>
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
                      <li>![alt text](bildurl) för bilder</li>
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

        {/* Image Upload Modal */}
        {showImageModal && (
          <ImageUploadModal
            isOpen={showImageModal}
            onClose={() => setShowImageModal(false)}
            onImageUpload={handleEmbeddedImageUpload}
            onImageUrl={handleImageUrlInsert}
            uploading={imageUploading}
            activeTab={imageModalType}
            setActiveTab={setImageModalType}
          />
        )}
      </div>
    </div>
  );
};

// Image Upload Modal Component
interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (file: File) => void;
  onImageUrl: (url: string, altText: string) => void;
  uploading: boolean;
  activeTab: 'upload' | 'url';
  setActiveTab: (tab: 'upload' | 'url') => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageUpload,
  onImageUrl,
  uploading,
  activeTab,
  setActiveTab
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    e.target.value = ''; // Reset input
  };

  const handleUrlSubmit = () => {
    onImageUrl(imageUrl, altText || 'Beskrivning av bild');
    setImageUrl('');
    setAltText('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-hemp-100">
          <h3 className="text-lg font-semibold text-hemp-900">Lägg till bild</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-hemp-100 rounded transition-colors duration-200"
          >
            <X className="w-5 h-5 text-hemp-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-hemp-100">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'upload'
                ? 'bg-hemp-50 text-hemp-700 border-b-2 border-hemp-600'
                : 'text-hemp-600 hover:text-hemp-800'
            }`}
          >
            Ladda upp
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'url'
                ? 'bg-hemp-50 text-hemp-700 border-b-2 border-hemp-600'
                : 'text-hemp-600 hover:text-hemp-800'
            }`}
          >
            URL
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <p className="text-sm text-hemp-600">
                Välj en bildfil från din dator att ladda upp.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="w-full p-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent disabled:opacity-50"
              />
              {uploading && (
                <p className="text-sm text-hemp-600">Laddar upp bild...</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-hemp-900 mb-2">
                  Bild-URL *
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent"
                  placeholder="https://example.com/bild.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-hemp-900 mb-2">
                  Alt-text (beskrivning)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full px-3 py-2 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent"
                  placeholder="Beskrivning av bilden"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  className="flex-1"
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl.trim()}
                  variant="primary"
                  className="flex-1"
                >
                  Lägg till
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Preview Component - Now uses the centralized markdown utility
interface BlogPreviewProps {
  formData: any;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ formData }) => {
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
        className="prose prose-lg max-w-none prose-hemp"
        dangerouslySetInnerHTML={{ 
          __html: markdownToHtml(formData.content || 'Innehåll kommer här...') 
        }}
      />
    </div>
  );
};

export default BlogEditorPage;