// src/lib/supabase.ts 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Make supabase available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

// Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  status: 'draft' | 'published';
  meta_title: string | null;
  meta_description: string | null;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

// Add partial type for user posts list
export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  updated_at: string;
  published_at: string | null;
  author?: {
    full_name: string | null;
    email: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}

// Helper functions
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[åäöÅÄÖ]/g, (match) => {
      const map: { [key: string]: string } = { 'å': 'a', 'ä': 'a', 'ö': 'o', 'Å': 'a', 'Ä': 'a', 'Ö': 'o' };
      return map[match] || match;
    })
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Cache for user profiles to reduce DB calls
const profileCache = new Map<string, { profile: Profile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Much more efficient getCurrentUser
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('getCurrentUser - Supabase auth user:', user?.id);
    
    if (!user) return null;

    // Check cache first
    const cached = profileCache.get(user.id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('getCurrentUser - Using cached profile');
      return {
        id: user.id,
        email: user.email!,
        profile: cached.profile
      };
    }

    // Single query to get or create profile
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('Error fetching profile:', selectError);
      return {
        id: user.id,
        email: user.email!,
        profile: undefined
      };
    }

    let profile = existingProfile;

    // fix: Only create profile if it doesn't exist
    if (!existingProfile) {
      console.log('Profile not found, creating new profile...');
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          role: 'user',
          approved: false // Only set to false for NEW profiles
        })
        .select()
        .single();

      if (insertError) {
        console.error('Profile creation error:', insertError);
        return {
          id: user.id,
          email: user.email!,
          profile: undefined
        };
      }

      profile = newProfile;
    } else {
      console.log('Existing profile found, preserving approval status:', existingProfile.approved);
    }

    // Cache the profile
    profileCache.set(user.id, { profile, timestamp: Date.now() });

    return {
      id: user.id,
      email: user.email!,
      profile
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
};

// Clear profile cache when user signs out
export const clearProfileCache = () => {
  profileCache.clear();
};

// Auth helpers (unchanged but with cache clearing)
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
};

export const signOut = async () => {
  clearProfileCache(); // Clear cache on sign out
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Simple cache for blog posts
const blogCache = new Map<string, { data: any; timestamp: number }>();
const BLOG_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for blog posts

// More efficient blog queries with caching
export const getPublishedPosts = async (): Promise<BlogPost[]> => {
  const cacheKey = 'published_posts';
  const cached = blogCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < BLOG_CACHE_DURATION) {
    console.log('Using cached published posts');
    return cached.data;
  }

  try {
    // 🔧 FIX: Select all required fields to match BlogPost type
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:profiles!blog_posts_author_id_fkey(full_name, email)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50); // Limit results to prevent large queries

    if (error) {
      console.error('Error fetching published posts:', error);
      throw error;
    }

    const result = posts || [];
    blogCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    console.error('getPublishedPosts error:', error);
    throw error;
  }
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const cacheKey = `post_${slug}`;
  const cached = blogCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < BLOG_CACHE_DURATION) {
    console.log(`Using cached post: ${slug}`);
    return cached.data;
  }

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Post not found
      }
      throw error;
    }

    blogCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('getPostBySlug error:', error);
    return null;
  }
};

// Clear blog cache when posts are modified
export const clearBlogCache = () => {
  Array.from(blogCache.keys()).forEach(key => {
    if (key.startsWith('published_posts') || key.startsWith('post_')) {
      blogCache.delete(key);
    }
  });
};

export const getUserPosts = async (userId: string): Promise<BlogPostSummary[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id, title, slug, status, updated_at, published_at,
        profiles!blog_posts_author_id_fkey(full_name, email)
      `)
      .eq('author_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match BlogPostSummary type
    const transformedData = (data as any[])?.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      updated_at: post.updated_at,
      published_at: post.published_at,
      author: post.profiles && post.profiles[0] ? {
        full_name: post.profiles[0].full_name,
        email: post.profiles[0].email
      } : undefined
    })) || [];

    return transformedData;
  } catch (error) {
    console.error('getUserPosts error:', error);
    throw error;
  }
};

export const createPost = async (post: Partial<BlogPost>): Promise<BlogPost> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (error) throw error;
    
    clearBlogCache(); // Clear cache when creating new post
    return data;
  } catch (error) {
    console.error('createPost error:', error);
    throw error;
  }
};

export const updatePost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (error) throw error;
    
    clearBlogCache(); // Clear cache when updating post
    return data;
  } catch (error) {
    console.error('updatePost error:', error);
    throw error;
  }
};

export const deletePost = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    clearBlogCache(); // Clear cache when deleting post
  } catch (error) {
    console.error('deletePost error:', error);
    throw error;
  }
};

// Image upload helper (unchanged)
export const uploadImage = async (file: File, userId: string): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('userId', userId);

  try {
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      } else {
        const errorText = await response.text();
        console.error('Non-JSON error response:', errorText);
        throw new Error(`Server error (${response.status}): Check console for details`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Expected JSON but got:', responseText);
      throw new Error('Server returned invalid response format');
    }

    const data = await response.json();
    
    if (!data.imageUrl) {
      throw new Error('Server did not return image URL');
    }
    
    return data.imageUrl;

  } catch (error) {
    console.error('Upload error details:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to upload image: ' + String(error || 'Unknown error'));
  }
};

// Admin helpers (unchanged)
export const getPendingUsers = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const approveUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ approved: true })
    .eq('id', userId);

  if (error) throw error;
  
  // Clear profile cache for this user
  profileCache.delete(userId);
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
  
  // Clear profile cache for this user
  profileCache.delete(userId);
};