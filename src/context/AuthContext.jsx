import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
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

    // Also check for redirect result (mobile)
    authService.handleRedirectResult().then((result) => {
      if (result.success && result.user) {
        // Auth state listener will handle the update
      }
    });

    return () => unsubscribe();
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
    setLoading(false);
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
