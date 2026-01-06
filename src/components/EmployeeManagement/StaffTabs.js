import React from 'react';
import './StaffTabs.css';

const StaffTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="staff-tabs">
      <button
        className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
        onClick={() => setActiveTab('employees')}
      >
        Employees
      </button>
      <button
        className={`tab-btn ${activeTab === 'interns' ? 'active' : ''}`}
        onClick={() => setActiveTab('interns')}
      >
        Interns
      </button>
    </div>
  );
};

export default StaffTabs;
