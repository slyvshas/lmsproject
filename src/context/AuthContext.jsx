// ============================================================================
// Authentication Context
// ============================================================================
// Manages user authentication state, loading, and errors globally throughout
// the application. Provides authentication functions like login, signup, logout.

import React, { createContext, useEffect, useState, useCallback } from 'react';
import supabase from '../config/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch user profile from users table with retry logic
   * (Profile is automatically created by database trigger)
   */
  const fetchUserProfile = useCallback(async (userId, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (data) return data;
        
        // If not found and we have retries left, wait and try again
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        if (i === retries - 1) return null;
      }
    }
    return null;
  }, []);

  /**
   * Ensure user profile exists (created automatically by database trigger)
   * This function fetches the profile with retries to handle async trigger execution
   */
  const ensureUserProfile = useCallback(
    async (authUser) => {
      if (!authUser) return null;
      
      // Profile is automatically created by database trigger
      // We just need to fetch it (with retries in case of timing)
      return fetchUserProfile(authUser.id);
    },
    [fetchUserProfile]
  );

  // Effect: Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current user from Supabase auth
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setUser(authUser);
          const profile = await ensureUserProfile(authUser);
          setUserProfile(profile);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          ensureUserProfile(session.user).then(setUserProfile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [ensureUserProfile]);

  /**
   * Sign up with email and password
   */
  const signup = useCallback(async (email, password, fullName) => {
    try {
      setError(null);
      setIsLoading(true);

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'student',
          },
        },
      });

      if (authError) throw authError;

      setUser(authData.user);

      // If email confirmation is required, session can be null here
      if (authData.session) {
        const profile = await ensureUserProfile(authData.user);
        setUserProfile(profile);
      }

      return { success: true, user: authData.user, needsEmailConfirmation: !authData.session };
    } catch (err) {
      const message = err.message || 'Signup failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  /**
   * Sign in with email and password
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      const profile = await ensureUserProfile(data.user, {
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || data.user.email,
        role: data.user.user_metadata?.role || 'student',
      });
      setUserProfile(profile);

      return { success: true, user: data.user };
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  /**
   * Sign out user
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Logout failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data);
      return { success: true, profile: data };
    } catch (err) {
      const message = err.message || 'Profile update failed';
      setError(message);
      return { success: false, error: message };
    }
  }, [user]);

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (email) => {
    try {
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { success: true };
    } catch (err) {
      const message = err.message || 'Password reset failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const value = {
    user,
    userProfile,
    isLoading,
    error,
    signup,
    login,
    logout,
    updateProfile,
    resetPassword,
    isAuthenticated: !!user,
    isStudent: userProfile?.role === 'student',
    isInstructor: userProfile?.role === 'instructor',
    isAdmin: userProfile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
