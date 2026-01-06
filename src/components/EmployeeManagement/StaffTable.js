import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import './StaffTable.css';

const StaffTable = ({ type, onEdit, onSelect }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, [type]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      // First, try with orderBy (requires index)
      try {
        const q = query(
          collection(db, 'staff'),
          where('type', '==', type === 'employees' ? 'employee' : 'intern'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const staffList = [];
        
        snapshot.forEach((doc) => {
          staffList.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort in memory as fallback
        staffList.sort((a, b) => {
          const aDate = a.createdAt?.toDate || a.createdAt || new Date(0);
          const bDate = b.createdAt?.toDate || b.createdAt || new Date(0);
          return bDate - aDate;
        });
        
        setStaff(staffList);
      } catch (indexError) {
        // If index error, fetch without orderBy and sort in memory
        if (indexError.code === 'failed-precondition') {
          console.warn('Index not ready, fetching without orderBy:', indexError.message);
          const q = query(
            collection(db, 'staff'),
            where('type', '==', type === 'employees' ? 'employee' : 'intern')
          );
          const snapshot = await getDocs(q);
          const staffList = [];
          
          snapshot.forEach((doc) => {
            staffList.push({ id: doc.id, ...doc.data() });
          });
          
          // Sort in memory by createdAt
          staffList.sort((a, b) => {
            const aDate = a.createdAt?.toDate || a.createdAt || new Date(0);
            const bDate = b.createdAt?.toDate || b.createdAt || new Date(0);
            return bDate - aDate;
          });
          
          setStaff(staffList);
          toast.info('Index is building. Data loaded without sorting. Please create the index for better performance.');
        } else {
          throw indexError;
        }
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      setDeletingId(staffId);
      await deleteDoc(doc(db, 'staff', staffId));
      toast.success('Staff member deleted successfully');
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff member');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="table-container">
        <div className="table-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton skeleton-cell" />
              <div className="skeleton skeleton-cell" />
              <div className="skeleton skeleton-cell" />
              <div className="skeleton skeleton-cell" />
              <div className="skeleton skeleton-cell" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Department</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No {type} found
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone || 'N/A'}</td>
                  <td>{member.role || 'N/A'}</td>
                  <td>{member.department || 'N/A'}</td>
                  <td>
                    {member.joiningDate?.toDate
                      ? member.joiningDate.toDate().toLocaleDateString()
                      : member.joiningDate || 'N/A'}
                  </td>
                  <td>
                    <span className={`status-badge ${member.status === 'active' ? 'active' : 'inactive'}`}>
                      {member.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => onSelect(member)}
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit(member)}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(member.id)}
                        disabled={deletingId === member.id}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTable;
