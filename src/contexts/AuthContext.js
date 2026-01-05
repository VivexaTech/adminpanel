import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Check if user exists in Firestore and is active
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.isActive) {
              setUserData(data);
              setIsAuthorized(true);
            } else {
              setUserData(null);
              setIsAuthorized(false);
              toast.error('Access Denied: Your account is inactive');
              await signOut(auth);
            }
          } else {
            // User document doesn't exist - check if super admin
            if (user.email === process.env.REACT_APP_SUPER_ADMIN_EMAIL) {
              // Super admin can proceed, but show message to create user doc
              setUserData({
                name: user.displayName || 'Super Admin',
                email: user.email,
                role: 'admin',
                isActive: true,
              });
              setIsAuthorized(true);
              toast.warning('Please create your user document in Firestore for full functionality');
            } else {
              setUserData(null);
              setIsAuthorized(false);
              toast.error('Access Denied: User not found. Please contact administrator.');
              await signOut(auth);
            }
          }
        } catch (error) {
          console.error('Error checking user access:', error);
          // If it's a permissions error and user is super admin, allow access
          if (error.code === 'permission-denied' && user.email === process.env.REACT_APP_SUPER_ADMIN_EMAIL) {
            setUserData({
              name: user.displayName || 'Super Admin',
              email: user.email,
              role: 'admin',
              isActive: true,
            });
            setIsAuthorized(true);
            toast.warning('Please update Firestore rules to allow reading user documents');
          } else {
            setUserData(null);
            setIsAuthorized(false);
            toast.error('Error verifying access. Please check Firestore rules.');
            await signOut(auth);
          }
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setIsAuthorized(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const isSuperAdmin = () => {
    return currentUser?.email === process.env.REACT_APP_SUPER_ADMIN_EMAIL;
  };

  const value = {
    currentUser,
    userData,
    loading,
    isAuthorized,
    login,
    logout,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
