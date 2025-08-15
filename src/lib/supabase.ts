// src/lib/supabase.ts (Updated - No BlogImage interface)
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
  featured_image: string | null; // Just a URL/path string
  status: 'draft' | 'published';
  meta_title: string | null;
  meta_description: string | null;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

// Removed BlogImage interface - not needed anymore

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

// Auth helpers
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('getCurrentUser - Supabase auth user:', user?.id);
    
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('getCurrentUser - Profile data:', { profile, error: profileError });

    // If profile doesn't exist, create it
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profile not found, creating...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          role: 'user',
          approved: false
        }])
        .select()
        .single();

      console.log('Profile creation result:', { newProfile, error: createError });

      return {
        id: user.id,
        email: user.email!,
        profile: newProfile || {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: null,
          role: 'user',
          approved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }

    return {
      id: user.id,
      email: user.email!,
      profile: profile || undefined
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
};

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
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Blog helpers
export const getPublishedPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
};

export const getUserPosts = async (userId: string): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('author_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createPost = async (post: Partial<BlogPost>): Promise<BlogPost> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([post])
    .select(`
      *,
      author:profiles(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const updatePost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
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
  return data;
};

export const deletePost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Image upload helper - uploads to local server
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

// Admin helpers
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
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
};