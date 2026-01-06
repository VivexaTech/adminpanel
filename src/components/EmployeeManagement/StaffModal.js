import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { doc, addDoc, updateDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import './StaffModal.css';

const StaffModal = ({ staff, type, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    joiningDate: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      const joiningDate = staff.joiningDate?.toDate
        ? staff.joiningDate.toDate().toISOString().split('T')[0]
        : staff.joiningDate || '';
      
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || '',
        department: staff.department || '',
        joiningDate: joiningDate,
        status: staff.status || 'active',
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        email: formData.email.toLowerCase().trim(), // Normalize email to avoid case-sensitivity issues
        type: type === 'employees' ? 'employee' : 'intern',
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate) : new Date(),
        createdAt: staff ? staff.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (staff) {
        await updateDoc(doc(db, 'staff', staff.id), dataToSave);
        toast.success(`${type === 'employees' ? 'Employee' : 'Intern'} updated successfully`);
      } else {
        await addDoc(collection(db, 'staff'), dataToSave);
        toast.success(`${type === 'employees' ? 'Employee' : 'Intern'} added successfully`);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('Failed to save staff member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{staff ? 'Edit' : 'Add'} {type === 'employees' ? 'Employee' : 'Intern'}</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g., Developer, Designer"
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., IT, Marketing"
            />
          </div>
          <div className="form-group">
            <label>Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (staff ? 'Update' : 'Add')} {type === 'employees' ? 'Employee' : 'Intern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
