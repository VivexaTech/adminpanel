import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiLayout,
  FiUsers,
  FiDollarSign,
  FiFileText,
  FiBriefcase,
  FiAward,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, isSuperAdmin, userData } = useAuth();

  const menuItems = [
    { path: '/', icon: FiLayout, label: 'Dashboard' },
    { path: '/clients', icon: FiUsers, label: 'Clients' },
    { path: '/invoices', icon: FiFileText, label: 'Invoices' },
    { path: '/portfolio', icon: FiBriefcase, label: 'Portfolio' },
    { path: '/certificates', icon: FiAward, label: 'Certificates' },
  ];

  if (isSuperAdmin()) {
    menuItems.push({ path: '/users', icon: FiSettings, label: 'Users' });
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Vivexa Tech</h3>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                onClick={toggleSidebar}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <p className="user-name">{userData?.name || 'User'}</p>
              <p className="user-role">{userData?.role || 'Staff'}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
