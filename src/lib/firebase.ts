// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

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

// Cache for user profiles
const profileCache = new Map<string, { profile: Profile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get current user with profile
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const user = auth.currentUser;
    console.log('getCurrentUser - Firebase auth user:', user?.uid);
    
    if (!user) return null;

    // Check cache first
    const cached = profileCache.get(user.uid);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('getCurrentUser - Using cached profile');
      return {
        id: user.uid,
        email: user.email!,
        profile: cached.profile
      };
    }

    // Get profile from Firestore
    const profileRef = doc(db, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);

    let profile: Profile;

    if (!profileSnap.exists()) {
      // Create new profile
      console.log('Profile not found, creating new profile...');
      profile = {
        id: user.uid,
        email: user.email!,
        full_name: user.displayName || null,
        avatar_url: user.photoURL || null,
        role: 'user',
        approved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(profileRef, {
        ...profile,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
    } else {
      // Convert Firestore data to Profile interface
      const data = profileSnap.data();
      profile = {
        ...data,
        id: user.uid,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
      } as Profile;
    }

    // Cache the profile
    profileCache.set(user.uid, { profile, timestamp: Date.now() });

    return {
      id: user.uid,
      email: user.email!,
      profile
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
};

// Clear profile cache
export const clearProfileCache = () => {
  profileCache.clear();
};

// Auth functions
export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: fullName
    });

    return { data: userCredential, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { data: userCredential, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
};

export const signOut = async () => {
  try {
    clearProfileCache();
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
};

// Blog cache
const blogCache = new Map<string, { data: any; timestamp: number }>();
const BLOG_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Blog functions
export const getPublishedPosts = async (): Promise<BlogPost[]> => {
  const cacheKey = 'published_posts';
  const cached = blogCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < BLOG_CACHE_DURATION) {
    console.log('Using cached published posts');
    return cached.data;
  }

  try {
    console.log('Fetching published posts from Firestore...');
    
    // Try a simpler query first to test basic read permissions
    const simpleQuery = query(
      collection(db, 'blog_posts'),
      where('status', '==', 'published'),
      limit(10)
    );

    console.log('Executing query...');
    const querySnapshot = await getDocs(simpleQuery);
    console.log(`Found ${querySnapshot.docs.length} published posts`);
    
    if (querySnapshot.empty) {
      console.log('No published posts found. This might be expected if no posts are published yet.');
      blogCache.set(cacheKey, { data: [], timestamp: Date.now() });
      return [];
    }

    const posts: BlogPost[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      console.log(`Processing post: ${data.title}, status: ${data.status}`);
      
      // Skip author profile fetching for public access to avoid permission errors
      // Author info can be cached or provided differently if needed for public view
      let author: Profile | undefined;
      
      // Only try to fetch author if we're authenticated
      const currentUser = auth.currentUser;
      if (data.author_id && currentUser) {
        try {
          const authorRef = doc(db, 'profiles', data.author_id);
          const authorSnap = await getDoc(authorRef);
          if (authorSnap.exists()) {
            const authorData = authorSnap.data();
            author = {
              ...authorData,
              id: data.author_id,
              created_at: authorData.created_at?.toDate?.()?.toISOString() || authorData.created_at,
              updated_at: authorData.updated_at?.toDate?.()?.toISOString() || authorData.updated_at
            } as Profile;
          }
        } catch (authorError) {
          console.warn('Could not fetch author profile:', authorError);
          // Continue without author info
        }
      } else if (data.author_id) {
        // For public access, create a minimal author object without fetching from profiles
        // This avoids permission errors while still showing some author info
        author = {
          id: data.author_id,
          email: 'Hampaoasen Team',
          full_name: 'Hampaoasen',
          avatar_url: null,
          role: 'user' as const,
          approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const post: BlogPost = {
        id: docSnapshot.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featured_image: data.featured_image,
        status: data.status,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        author_id: data.author_id,
        author,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
        published_at: data.published_at?.toDate?.()?.toISOString() || data.published_at
      };

      posts.push(post);
    }

    // Sort by published_at on the client side to avoid compound index issues
    const sortedPosts = posts.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at);
      const dateB = new Date(b.published_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`Successfully processed ${sortedPosts.length} published posts`);
    blogCache.set(cacheKey, { data: sortedPosts, timestamp: Date.now() });
    return sortedPosts;
  } catch (error: any) {
    console.error('getPublishedPosts error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Blogginläggen är för tillfället inte tillgängliga för allmänheten. Kontakta oss för mer information.');
    } else if (error.code === 'unavailable') {
      throw new Error('Bloggtjänsten är tillfälligt otillgänglig. Försök igen senare.');
    } else if (error.code === 'failed-precondition') {
      console.warn('Compound index might be missing. Using simpler query.');
      throw new Error('Bloggdatabasen konfigureras. Försök igen om en stund.');
    } else {
      throw new Error(`Problem med att ladda blogginlägg: ${error.message}`);
    }
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
    const q = query(
      collection(db, 'blog_posts'),
      where('slug', '==', slug)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const docSnapshot = querySnapshot.docs[0];
    const data = docSnapshot.data();

    // Handle author profile with permission checks
    let author: Profile | undefined;
    
    if (data.author_id) {
      // Only try to fetch author profile if we're authenticated
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const authorRef = doc(db, 'profiles', data.author_id);
          const authorSnap = await getDoc(authorRef);
          if (authorSnap.exists()) {
            const authorData = authorSnap.data();
            author = {
              ...authorData,
              id: data.author_id,
              created_at: authorData.created_at?.toDate?.()?.toISOString() || authorData.created_at,
              updated_at: authorData.updated_at?.toDate?.()?.toISOString() || authorData.updated_at
            } as Profile;
          }
        } catch (authorError) {
          console.warn('Could not fetch author profile:', authorError);
          // Continue without author info
        }
      } else {
        // For public access, create a default author object
        author = {
          id: data.author_id,
          email: 'Hampaoasen Team',
          full_name: 'Hampaoasen',
          avatar_url: null,
          role: 'user' as const,
          approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }

    const post: BlogPost = {
      id: docSnapshot.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featured_image: data.featured_image,
      status: data.status,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      author_id: data.author_id,
      author,
      created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
      updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
      published_at: data.published_at?.toDate?.()?.toISOString() || data.published_at
    };

    blogCache.set(cacheKey, { data: post, timestamp: Date.now() });
    return post;
  } catch (error) {
    console.error('getPostBySlug error:', error);
    return null;
  }
};

// Clear blog cache
export const clearBlogCache = () => {
  Array.from(blogCache.keys()).forEach(key => {
    if (key.startsWith('published_posts') || key.startsWith('post_')) {
      blogCache.delete(key);
    }
  });
};

export const getUserPosts = async (userId: string): Promise<BlogPostSummary[]> => {
  try {
    const q = query(
      collection(db, 'blog_posts'),
      where('author_id', '==', userId),
      orderBy('updated_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const posts: BlogPostSummary[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      
      // Get author profile
      let author: { full_name: string | null; email: string } | undefined;
      const authorRef = doc(db, 'profiles', data.author_id);
      const authorSnap = await getDoc(authorRef);
      if (authorSnap.exists()) {
        const authorData = authorSnap.data();
        author = {
          full_name: authorData.full_name,
          email: authorData.email
        };
      }

      const post: BlogPostSummary = {
        id: docSnapshot.id,
        title: data.title,
        slug: data.slug,
        status: data.status,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
        published_at: data.published_at?.toDate?.()?.toISOString() || data.published_at,
        author
      };

      posts.push(post);
    }

    return posts;
  } catch (error) {
    console.error('getUserPosts error:', error);
    throw error;
  }
};

export const createPost = async (post: Partial<BlogPost>): Promise<BlogPost> => {
  try {
    const now = Timestamp.now();
    const postData = {
      ...post,
      created_at: now,
      updated_at: now,
      published_at: post.status === 'published' ? (post.published_at ? Timestamp.fromDate(new Date(post.published_at)) : now) : null
    };

    await addDoc(collection(db, 'blog_posts'), postData);
    
    // Get the created post with author info
    const createdPost = await getPostBySlug(post.slug!);
    
    clearBlogCache();
    return createdPost!;
  } catch (error) {
    console.error('createPost error:', error);
    throw error;
  }
};

export const updatePost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
  try {
    const postRef = doc(db, 'blog_posts', id);
    const updateData = {
      ...updates,
      updated_at: Timestamp.now(),
      published_at: updates.status === 'published' && updates.published_at 
        ? Timestamp.fromDate(new Date(updates.published_at)) 
        : undefined
    };

    await updateDoc(postRef, updateData);
    
    // Get the updated post
    const updatedPost = await getPostBySlug(updates.slug!);
    
    clearBlogCache();
    return updatedPost!;
  } catch (error) {
    console.error('updatePost error:', error);
    throw error;
  }
};

export const deletePost = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'blog_posts', id));
    clearBlogCache();
  } catch (error) {
    console.error('deletePost error:', error);
    throw error;
  }
};

// Image upload helper
export const uploadImage = async (file: File, userId: string): Promise<string> => {
  try {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `blog-images/${userId}/${filename}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Upload error details:', error);
    throw new Error('Failed to upload image: ' + String(error));
  }
};

// Admin functions
export const getPendingUsers = async (): Promise<Profile[]> => {
  try {
    const q = query(
      collection(db, 'profiles'),
      where('approved', '==', false),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const users: Profile[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        ...data,
        id: doc.id,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
      } as Profile);
    });

    return users;
  } catch (error) {
    console.error('getPendingUsers error:', error);
    throw error;
  }
};

export const approveUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'profiles', userId);
    await updateDoc(userRef, {
      approved: true,
      updated_at: Timestamp.now()
    });
    
    // Clear profile cache for this user
    profileCache.delete(userId);
  } catch (error) {
    console.error('approveUser error:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<void> => {
  try {
    const userRef = doc(db, 'profiles', userId);
    await updateDoc(userRef, {
      role,
      approved: true, // Auto-approve when making admin
      updated_at: Timestamp.now()
    });
    
    // Clear profile cache for this user
    profileCache.delete(userId);
  } catch (error) {
    console.error('updateUserRole error:', error);
    throw error;
  }
};