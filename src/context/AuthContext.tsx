import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
  verifyPhoneCode: (phone: string, code: string) => Promise<void>; // Nuevo método para verificar el código
  signup: (email: string, password: string, metadata: { full_name: string }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser ] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser (session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser (session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Successfully logged in!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const loginWithPhone = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      toast.success('Código de verificación enviado al número de teléfono.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const verifyPhoneCode = async (phone: string, code: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
      if (error) throw error;
      toast.success('Inicio de sesión exitoso!');
      // Aquí puedes manejar la lógica después de un inicio de sesión exitoso
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signup = async (email: string, password: string, metadata: { full_name: string }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully logged out!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      toast.success('Password reset instructions have been sent to your email!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser ({
        password: newPassword,
      });
      if (error) throw error;
      toast.success('Password successfully updated!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        userRole,
        login,
        loginWithPhone,
        verifyPhoneCode, // Proporcionar el nuevo método
        signup,
        logout,
        resetPassword,
        updatePassword,
        signInWithGoogle,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
