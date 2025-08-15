// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, AuthUser, getCurrentUser } from '../lib/supabase';

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

  // Remove refreshUser from dependencies to prevent infinite loop
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
    let isInitialLoad = true;

    // Only handle auth state changes, not initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event, session?.user?.id);
        
        // Skip INITIAL_SESSION to prevent duplicate calls
        if (event === 'INITIAL_SESSION') {
          if (session?.user && isInitialLoad) {
            console.log('Initial session found, loading user profile...');
            try {
              setIsRefreshing(true);
              const currentUser = await getCurrentUser();
              console.log('Auth context - initial user loaded:', currentUser?.id);
              setUser(currentUser);
            } catch (error) {
              console.error('Error loading initial user:', error);
              setUser(null);
            } finally {
              setIsRefreshing(false);
              setLoading(false);
              isInitialLoad = false;
            }
          } else {
            console.log('No initial session found');
            setUser(null);
            setLoading(false);
            isInitialLoad = false;
          }
          return;
        }

        // Handle other auth events
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('User signed out or no session');
          setUser(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed, refreshing profile...');
          if (!isRefreshing) {
            try {
              setIsRefreshing(true);
              const currentUser = await getCurrentUser();
              console.log('Auth context - user refreshed:', currentUser?.id);
              setUser(currentUser);
            } catch (error) {
              console.error('Error refreshing user:', error);
              setUser(null);
            } finally {
              setIsRefreshing(false);
            }
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent infinite loop

  const signUp = async (email: string, password: string, fullName: string) => {
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

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    // Auth state change listener will handle setting user to null
    return { error };
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