import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const isSuperAdminEmail = user.email === process.env.REACT_APP_SUPER_ADMIN_EMAIL || user.email === 'vivexatech@gmail.com';
        
        // Check if super admin
        if (isSuperAdminEmail) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data.isActive) {
                setUserData(data);
                setIsAuthorized(true);
                setStaffData(null); // Clear staff data for admin
              } else {
                setUserData(null);
                setIsAuthorized(false);
                toast.error('Access Denied: Your account is inactive');
                await signOut(auth);
              }
            } else {
              // Super admin can proceed even without user doc
              setUserData({
                name: user.displayName || 'Super Admin',
                email: user.email,
                role: 'admin',
                isActive: true,
              });
              setIsAuthorized(true);
              setStaffData(null);
            }
          } catch (error) {
            console.error('Error checking admin access:', error);
            // Allow super admin access even if there's an error
            if (error.code === 'permission-denied') {
              setUserData({
                name: user.displayName || 'Super Admin',
                email: user.email,
                role: 'admin',
                isActive: true,
              });
              setIsAuthorized(true);
              setStaffData(null);
            } else {
              setUserData(null);
              setIsAuthorized(false);
              toast.error('Error verifying access');
              await signOut(auth);
            }
          }
        } else {
          // Staff member - check staff collection
          try {
            // Normalize email to lowercase for consistent matching
            const normalizedEmail = user.email?.toLowerCase().trim();
            const staffQuery = query(
              collection(db, 'staff'),
              where('email', '==', normalizedEmail)
            );
            const staffSnapshot = await getDocs(staffQuery);
            
            if (!staffSnapshot.empty) {
              const staffDoc = staffSnapshot.docs[0];
              const staffInfo = { id: staffDoc.id, ...staffDoc.data() };
              
              // Check if staff is active
              if (staffInfo.status === 'active') {
                setStaffData(staffInfo);
                setUserData({
                  name: staffInfo.name,
                  email: staffInfo.email,
                  role: 'staff',
                  isActive: true,
                });
                setIsAuthorized(true);
              } else {
                setStaffData(null);
                setUserData(null);
                setIsAuthorized(false);
                toast.error('Access Denied: Your account is inactive');
                await signOut(auth);
              }
            } else {
              setStaffData(null);
              setUserData(null);
              setIsAuthorized(false);
              toast.error('Access Denied: Staff record not found. Please contact administrator.');
              await signOut(auth);
            }
          } catch (staffError) {
            console.error('Error checking staff access:', staffError);
            setStaffData(null);
            setUserData(null);
            setIsAuthorized(false);
            toast.error('Error verifying staff access');
            await signOut(auth);
          }
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setStaffData(null);
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
    return currentUser?.email === process.env.REACT_APP_SUPER_ADMIN_EMAIL || currentUser?.email === 'vivexatech@gmail.com';
  };

  const value = {
    currentUser,
    userData,
    staffData,
    loading,
    isAuthorized,
    login,
    logout,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
