import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import TaskModal from './TaskModal';
import './TasksSection.css';

const TasksSection = ({ staff, onBack }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

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
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const tasksList = [];
        
        snapshot.forEach((doc) => {
          tasksList.push({ id: doc.id, ...doc.data() });
        });
        
        setTasks(tasksList);
      } catch (indexError) {
        // If index error, fetch without orderBy and sort in memory
        if (indexError.code === 'failed-precondition') {
          console.warn('Index not ready, fetching without orderBy');
          const q = query(
            collection(db, 'tasks'),
            where('assigneeId', '==', staff.id)
          );
          const snapshot = await getDocs(q);
          const tasksList = [];
          
          snapshot.forEach((doc) => {
            tasksList.push({ id: doc.id, ...doc.data() });
          });
          
          // Sort in memory
          tasksList.sort((a, b) => {
            const aDate = a.createdAt?.toDate || a.createdAt || new Date(0);
            const bDate = b.createdAt?.toDate || b.createdAt || new Date(0);
            return bDate - aDate;
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

  const handleAdd = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const filteredTasks = filterStatus === 'all'
    ? tasks
    : tasks.filter(task => task.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      default:
        return 'warning';
    }
  };

  return (
    <div className="tasks-section">
      <div className="section-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <FiArrowLeft /> Back
          </button>
          <h3>Tasks - {staff.name}</h3>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Add Task
        </button>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilterStatus('in-progress')}
        >
          In Progress
        </button>
        <button
          className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="no-data">No tasks found</div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h4>{task.title}</h4>
                <select
                  className={`status-select status-${getStatusColor(task.status)}`}
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <p className="task-description">{task.description || 'No description'}</p>
              <div className="task-meta">
                <div className="task-progress">
                  <label>Progress: {task.progress || 0}%</label>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${task.progress || 0}%` }}
                    />
                  </div>
                </div>
                <div className="task-due-date">
                  Due: {task.dueDate?.toDate
                    ? task.dueDate.toDate().toLocaleDateString()
                    : task.dueDate || 'No due date'}
                </div>
              </div>
              <div className="task-actions">
                <button
                  className="action-btn edit"
                  onClick={() => handleEdit(task)}
                >
                  <FiEdit /> Edit
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(task.id)}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editingTask}
          staff={staff}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSave={fetchTasks}
        />
      )}
    </div>
  );
};

export default TasksSection;
