// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, AuthUser, getCurrentUser, signUp as firebaseSignUp, signIn as firebaseSignIn, signOut as firebaseSignOut } from '../lib/firebase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh user profile data
  const refreshUser = useCallback(async () => {
    // Prevent multiple concurrent refresh calls
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      const currentUser = await getCurrentUser();
      console.log('Auth context - refreshUser result:', currentUser?.id);
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    let mounted = true;

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!mounted) return;
      
      console.log('🔄 Firebase auth state change:', firebaseUser?.uid);
      
      if (firebaseUser) {
        // User is signed in
        console.log('User signed in, loading profile...');
        if (!isRefreshing) {
          try {
            setIsRefreshing(true);
            const currentUser = await getCurrentUser();
            console.log('Auth context - user loaded:', currentUser?.id);
            setUser(currentUser);
          } catch (error) {
            console.error('Error loading user profile:', error);
            setUser(null);
          } finally {
            setIsRefreshing(false);
          }
        }
      } else {
        // User is signed out
        console.log('User signed out');
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []); // Empty dependency array to prevent infinite loop

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await firebaseSignUp(email, password, fullName);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await firebaseSignIn(email, password);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await firebaseSignOut();
    // Auth state change listener will handle setting user to null
    return result;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};