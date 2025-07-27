import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';


type AuthResponse = {
  success: boolean;
  user?: User | null;
  session?: Session | null;
  error?: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signUpNewUser: (email: string, password: string, username?: string) => Promise<AuthResponse>;
  signInUser: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: { username?: string }) => Promise<AuthResponse>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const signUpNewUser = async (email: string, password: string, username?: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: { username }
        }
      });

      if (error) throw error;

      // Guardar información en tabla "profiles"
      if (data.user) {
        await supabase
          .from('profiles')
          .upsert({
            user_id: data.user.id,
            username,
            email: data.user.email
          });
      }

      return {
        success: true,
        user: data.user ?? null,
        session: data.session ?? null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof AuthError ? error.message : 'Registration failed'
      };
    }
  };

  const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (error) throw error;
      if (!data.session || !data.user) throw new Error('Authentication failed');

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof AuthError ? error.message : 'Login failed'
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof AuthError ? error.message : 'Logout failed'
      };
    }
  };

  const updateUserProfile = async (updates: { username?: string }): Promise<AuthResponse> => {
    if (!user) return { success: false, error: 'No authenticated user' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof AuthError ? error.message : 'Profile update failed'
      };
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
    };

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user ?? null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      signUpNewUser,
      signInUser,
      signOut,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};
