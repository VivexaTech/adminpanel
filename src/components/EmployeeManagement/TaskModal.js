import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import './TaskModal.css';

const TaskModal = ({ task, staff, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    dueDate: '',
    progress: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      const dueDate = task.dueDate?.toDate
        ? task.dueDate.toDate().toISOString().split('T')[0]
        : task.dueDate || '';
      
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        dueDate: dueDate,
        progress: task.progress || 0,
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        assigneeId: staff.id,
        progress: parseInt(formData.progress) || 0,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        createdAt: task ? task.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (task) {
        await updateDoc(doc(db, 'tasks', task.id), dataToSave);
        toast.success('Task updated successfully');
      } else {
        await addDoc(collection(db, 'tasks'), dataToSave);
        toast.success('Task added successfully');
      }
      
      onClose();
      onSave();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'Add Task'}</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Progress (%)</label>
              <input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (task ? 'Update' : 'Add')} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
