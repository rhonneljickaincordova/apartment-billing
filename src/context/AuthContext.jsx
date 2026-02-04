import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      // First, check for redirect result (important for mobile)
      try {
        const redirectResult = await authService.handleRedirectResult();
        if (redirectResult.success && redirectResult.user) {
          // Redirect login successful, auth state listener will update the user
          console.log('Redirect login successful');
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      }

      // Then set up the auth state listener
      unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          // Merge with stored session data
          const storedSession = authService.getStoredSession();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            accessToken: storedSession?.accessToken || null,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Restore selected app from localStorage
  useEffect(() => {
    const storedApp = localStorage.getItem('apt_billing_selected_app');
    if (storedApp) {
      setSelectedApp(storedApp);
    }
  }, []);

  const login = useCallback(async () => {
    setLoading(true);
    const result = await authService.signInWithFacebook();
    // Don't set loading to false if it's a redirect (page will navigate away)
    if (!result.pending) {
      setLoading(false);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    const result = await authService.signOut();
    setSelectedApp(null);
    localStorage.removeItem('apt_billing_selected_app');
    setLoading(false);
    return result;
  }, []);

  const selectApp = useCallback((appName) => {
    setSelectedApp(appName);
    localStorage.setItem('apt_billing_selected_app', appName);
  }, []);

  const goBackToAppSelection = useCallback(() => {
    setSelectedApp(null);
    localStorage.removeItem('apt_billing_selected_app');
  }, []);

  const value = {
    user,
    loading,
    selectedApp,
    isAuthenticated: !!user,
    login,
    logout,
    selectApp,
    goBackToAppSelection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
