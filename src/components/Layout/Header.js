import React from 'react';
import { FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';

const Header = ({ toggleSidebar, pageTitle }) => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="main-header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <FiMenu />
        </button>
        <h1 className="page-title">{pageTitle || 'Dashboard'}</h1>
      </div>
      <div className="header-right">
        <button className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </header>
  );
};

export default Header;
