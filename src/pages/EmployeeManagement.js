import React, { useState, useCallback } from 'react';
import StaffTabs from '../components/EmployeeManagement/StaffTabs';
import StaffTable from '../components/EmployeeManagement/StaffTable';
import StaffModal from '../components/EmployeeManagement/StaffModal';
import TasksSection from '../components/EmployeeManagement/TasksSection';
import AttendanceSection from '../components/EmployeeManagement/AttendanceSection';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' or 'interns'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [activeSection, setActiveSection] = useState('staff'); // 'staff', 'tasks', 'attendance'
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleAddStaff = () => {
    setEditingStaff(null);
    setShowStaffModal(true);
  };

  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setShowStaffModal(true);
  };

  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    setActiveSection('tasks');
  };

  return (
    <div className="employee-management">
      <div className="management-header">
        <div className="section-tabs">
          <button
            className={`section-tab ${activeSection === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveSection('staff')}
          >
            Staff Management
          </button>
          {selectedStaff && (
            <>
              <button
                className={`section-tab ${activeSection === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveSection('tasks')}
              >
                Tasks
              </button>
              <button
                className={`section-tab ${activeSection === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveSection('attendance')}
              >
                Attendance
              </button>
            </>
          )}
        </div>
      </div>

      {activeSection === 'staff' && (
        <div className="staff-section">
          <div className="section-header">
            <StaffTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <button className="btn btn-primary" onClick={handleAddStaff}>
              + Add {activeTab === 'employees' ? 'Employee' : 'Intern'}
            </button>
          </div>
          <StaffTable
            key={refreshKey}
            type={activeTab}
            onEdit={handleEditStaff}
            onSelect={handleStaffSelect}
          />
        </div>
      )}

      {activeSection === 'tasks' && selectedStaff && (
        <TasksSection staff={selectedStaff} onBack={() => setActiveSection('staff')} />
      )}

      {activeSection === 'attendance' && selectedStaff && (
        <AttendanceSection staff={selectedStaff} onBack={() => setActiveSection('staff')} />
      )}

      {showStaffModal && (
        <StaffModal
          staff={editingStaff}
          type={activeTab}
          onClose={() => {
            setShowStaffModal(false);
            setEditingStaff(null);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;
