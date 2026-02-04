import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const facebookProvider = new FacebookAuthProvider();
const googleProvider = new GoogleAuthProvider();

// Session persistence key
const SESSION_KEY = 'apt_billing_session';

export const authService = {
  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Sign in with Facebook (try popup first, fallback to redirect)
  async signInWithFacebook() {
    try {
      // Try popup first for all devices (better UX when it works)
      const result = await signInWithPopup(auth, facebookProvider);
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      // Store session data
      const sessionData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        accessToken,
        lastLogin: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

      return { success: true, user: result.user, accessToken };
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, facebookProvider);
          return { success: true, pending: true };
        } catch (redirectError) {
          return {
            success: false,
            error: redirectError.message,
            errorCode: redirectError.code,
          };
        }
      }
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      // Store session data
      const sessionData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        accessToken,
        provider: 'google',
        lastLogin: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

      return { success: true, user: result.user, accessToken };
    } catch (error) {
      console.error('Google sign-in error:', error);
      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return { success: true, pending: true };
        } catch (redirectError) {
          return {
            success: false,
            error: redirectError.message,
            errorCode: redirectError.code,
          };
        }
      }
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
  },

  // Handle redirect result
  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;

        const sessionData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          accessToken,
          lastLogin: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

        return { success: true, user: result.user, accessToken };
      }
      return { success: false, user: null };
    } catch (error) {
      console.error('Redirect result error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      localStorage.removeItem(SESSION_KEY);
      return { success: true };
    } catch (error) {
      console.error('Sign-out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get stored session
  getStoredSession() {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // Subscribe to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },
};

export default authService;
