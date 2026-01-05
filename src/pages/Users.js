import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import UserModal from '../components/Users/UserModal';
import UserTable from '../components/Users/UserTable';
import './Users.css';

const Users = () => {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (isSuperAdmin()) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      const usersList = [];
      
      snapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSave = async (userData) => {
    try {
      if (editingUser) {
        await updateDoc(doc(db, 'users', editingUser.id), {
          ...userData,
          updatedAt: new Date(),
        });
        toast.success('User updated successfully');
      } else {
        // For new users, we need the UID from Firebase Auth
        // This should be handled after user signs in with Google
        toast.info('Please have the user sign in with Google first, then add them here');
        return;
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus,
        updatedAt: new Date(),
      });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  if (!isSuperAdmin()) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only Super Admin can access this page.</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add User
        </button>
      </div>

      <UserTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
      />

      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Users;
