import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { doc, addDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import './AttendanceModal.css';

const AttendanceModal = ({ staff, date, existingRecord, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    status: 'present',
    checkIn: '',
    checkOut: '',
    leaveType: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingRecord) {
      const checkIn = existingRecord.checkIn?.toDate
        ? existingRecord.checkIn.toDate().toTimeString().slice(0, 5)
        : '';
      const checkOut = existingRecord.checkOut?.toDate
        ? existingRecord.checkOut.toDate().toTimeString().slice(0, 5)
        : '';
      
      setFormData({
        status: existingRecord.status || 'present',
        checkIn: checkIn,
        checkOut: checkOut,
        leaveType: existingRecord.leaveType || '',
        notes: existingRecord.notes || '',
      });
    } else {
      // Set current time as default for check-in
      const now = new Date();
      setFormData({
        status: 'present',
        checkIn: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        checkOut: '',
        leaveType: '',
        notes: '',
      });
    }
  }, [existingRecord]);

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      
      // Convert time strings to Date objects
      const dateObj = new Date(date);
      let checkInTime = null;
      let checkOutTime = null;

      if (formData.status === 'present' && formData.checkIn) {
        const [hours, minutes] = formData.checkIn.split(':');
        checkInTime = new Date(dateObj);
        checkInTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      if (formData.status === 'present' && formData.checkOut) {
        const [hours, minutes] = formData.checkOut.split(':');
        checkOutTime = new Date(dateObj);
        checkOutTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      const dataToSave = {
        staffId: staff.id,
        date: new Date(date),
        status: formData.status,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        leaveType: formData.status === 'leave' ? formData.leaveType : null,
        notes: formData.notes || null,
        createdAt: existingRecord ? existingRecord.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (existingRecord) {
        await updateDoc(doc(db, 'attendance', existingRecord.id), dataToSave);
        toast.success('Attendance updated successfully');
      } else {
        await addDoc(collection(db, 'attendance'), dataToSave);
        toast.success('Attendance marked successfully');
      }
      
      onClose();
      onSave();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Mark Attendance - {new Date(date).toLocaleDateString()}</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
            </select>
          </div>

          {formData.status === 'present' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Check In Time</label>
                  <input
                    type="time"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Check Out Time</label>
                  <input
                    type="time"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {formData.status === 'leave' && (
            <div className="form-group">
              <label>Leave Type</label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
              >
                <option value="">Select leave type</option>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (existingRecord ? 'Update' : 'Mark')} Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;
