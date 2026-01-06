import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import './EmployeeTasks.css';

const EmployeeTasks = ({ staff }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [staff]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'tasks'),
          where('assigneeId', '==', staff.id),
          where('status', '!=', 'completed')
        );
        const snapshot = await getDocs(q);
        const tasksList = [];
        
        snapshot.forEach((doc) => {
          tasksList.push({ id: doc.id, ...doc.data() });
        });
        
        // Also fetch completed tasks
        const completedQuery = query(
          collection(db, 'tasks'),
          where('assigneeId', '==', staff.id),
          where('status', '==', 'completed')
        );
        const completedSnapshot = await getDocs(completedQuery);
        completedSnapshot.forEach((doc) => {
          tasksList.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by due date and status
        tasksList.sort((a, b) => {
          if (a.status === 'completed' && b.status !== 'completed') return 1;
          if (a.status !== 'completed' && b.status === 'completed') return -1;
          const aDate = a.dueDate?.toDate || a.dueDate || new Date(9999999999999);
          const bDate = b.dueDate?.toDate || b.dueDate || new Date(9999999999999);
          return aDate - bDate;
        });
        
        setTasks(tasksList);
      } catch (indexError) {
        // Fallback: fetch all tasks and filter in memory
        if (indexError.code === 'failed-precondition') {
          const q = query(collection(db, 'tasks'));
          const snapshot = await getDocs(q);
          const tasksList = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.assigneeId === staff.id) {
              tasksList.push({ id: doc.id, ...data });
            }
          });
          
          tasksList.sort((a, b) => {
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            if (a.status !== 'completed' && b.status === 'completed') return -1;
            const aDate = a.dueDate?.toDate || a.dueDate || new Date(9999999999999);
            const bDate = b.dueDate?.toDate || b.dueDate || new Date(9999999999999);
            return aDate - bDate;
          });
          
          setTasks(tasksList);
        } else {
          throw indexError;
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingId(taskId);
      await updateDoc(doc(db, 'tasks', taskId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProgressChange = async (taskId, newProgress) => {
    try {
      setUpdatingId(taskId);
      const progress = Math.max(0, Math.min(100, parseInt(newProgress) || 0));
      await updateDoc(doc(db, 'tasks', taskId), {
        progress: progress,
        updatedAt: new Date(),
      });
      if (progress === 100) {
        await updateDoc(doc(db, 'tasks', taskId), {
          status: 'completed',
        });
      }
      toast.success('Progress updated');
      fetchTasks();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="status-icon completed" />;
      case 'in-progress':
        return <FiClock className="status-icon in-progress" />;
      default:
        return <FiAlertCircle className="status-icon pending" />;
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    return due < new Date() && due.toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return <div className="loading-state">Loading your tasks...</div>;
  }

  return (
    <div className="employee-tasks">
      <h2>My Tasks</h2>
      
      {tasks.length === 0 ? (
        <div className="no-tasks">
          <FiCheckCircle />
          <p>No tasks assigned</p>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`task-card ${task.status === 'completed' ? 'completed' : ''} ${isOverdue(task.dueDate) ? 'overdue' : ''}`}
            >
              <div className="task-header">
                <div className="task-title-section">
                  {getStatusIcon(task.status)}
                  <h3>{task.title}</h3>
                </div>
                <select
                  className={`status-select status-${task.status}`}
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  disabled={updatingId === task.id}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-progress-section">
                <label>Progress: {task.progress || 0}%</label>
                <div className="progress-input-group">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress || 0}
                    onChange={(e) => handleProgressChange(task.id, e.target.value)}
                    disabled={updatingId === task.id}
                    className="progress-slider"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={task.progress || 0}
                    onChange={(e) => handleProgressChange(task.id, e.target.value)}
                    disabled={updatingId === task.id}
                    className="progress-input"
                  />
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${task.progress || 0}%` }}
                  />
                </div>
              </div>

              {task.dueDate && (
                <div className={`task-due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                  Due: {task.dueDate.toDate
                    ? task.dueDate.toDate().toLocaleDateString()
                    : new Date(task.dueDate).toLocaleDateString()}
                  {isOverdue(task.dueDate) && <span className="overdue-badge">Overdue</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
