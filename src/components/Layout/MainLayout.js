import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'Dashboard',
      '/clients': 'Clients',
      '/invoices': 'Invoices',
      '/portfolio': 'Portfolio',
      '/certificates': 'Certificates',
      '/employees': 'Employee Management',
      '/my-portal': 'My Portal',
      '/users': 'Users',
    };
    return titles[path] || 'Dashboard';
  };

  return (
    <div className="main-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} pageTitle={getPageTitle()} />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
