// src/lib/firebase-debug.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Debug function to test Firestore connectivity and data
 * Call this from browser console: window.debugFirestore()
 */
export const debugFirestore = async () => {
  console.log('🔍 Starting Firestore debug...');
  
  try {
    // Test 1: Try to read the collection without any filters
    console.log('📋 Test 1: Reading blog_posts collection (no filters)...');
    const allPostsRef = collection(db, 'blog_posts');
    const allSnapshot = await getDocs(allPostsRef);
    
    console.log(`Found ${allSnapshot.docs.length} total blog posts`);
    
    if (allSnapshot.docs.length > 0) {
      allSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Post ${index + 1}:`, {
          id: doc.id,
          title: data.title,
          status: data.status,
          published_at: data.published_at,
          created_at: data.created_at
        });
      });
    }
    
    // Test 2: Check if we can read published posts specifically
    console.log('📋 Test 2: Testing published posts query...');
    try {
      const { getPublishedPosts } = await import('./firebase');
      const publishedPosts = await getPublishedPosts();
      console.log(`✅ Successfully fetched ${publishedPosts.length} published posts`);
    } catch (publishedError) {
      console.error('❌ Failed to fetch published posts:', publishedError);
    }
    
    // Test 3: Check authentication state
    console.log('📋 Test 3: Checking authentication state...');
    try {
      const { getCurrentUser } = await import('./firebase');
      const currentUser = await getCurrentUser();
      if (currentUser) {
        console.log('✅ User is authenticated:', currentUser.email);
      } else {
        console.log('ℹ️ User is not authenticated (this is expected for public access test)');
      }
    } catch (authError) {
      console.error('❌ Auth check failed:', authError);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Error details:', {
      code: (error as any).code,
      message: (error as any).message
    });
  }
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).debugFirestore = debugFirestore;
}