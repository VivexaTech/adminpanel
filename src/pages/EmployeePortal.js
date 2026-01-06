import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import EmployeeTasks from '../components/EmployeePortal/EmployeeTasks';
import EmployeeAttendance from '../components/EmployeePortal/EmployeeAttendance';
import { FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';
import './EmployeePortal.css';

const EmployeePortal = () => {
  const { currentUser, staffData, isSuperAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');

  // Redirect super admin away from this page
  if (!loading && isSuperAdmin()) {
    return <Navigate to="/" replace />;
  }

  // Show loading or access denied if no staff record
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!staffData) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You are not registered as staff. Please contact administrator.</p>
      </div>
    );
  }

  return (
    <div className="employee-portal">
      <div className="portal-header">
        <div className="user-welcome">
          <h1>Welcome, {staffData.name}</h1>
          <p className="user-role">{staffData.role || 'Staff'} • {staffData.department || 'General'}</p>
        </div>
      </div>

      <div className="portal-tabs">
        <button
          className={`portal-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <FiCheckCircle />
          <span>My Tasks</span>
        </button>
        <button
          className={`portal-tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <FiCalendar />
          <span>Attendance</span>
        </button>
      </div>

      <div className="portal-content">
        {activeTab === 'tasks' && <EmployeeTasks staff={staffData} />}
        {activeTab === 'attendance' && <EmployeeAttendance staff={staffData} />}
      </div>
    </div>
  );
};

export default EmployeePortal;
