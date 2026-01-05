import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiLogIn } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Vivexa Tech</h1>
          <p>Admin Panel</p>
        </div>
        <div className="login-body">
          <p className="login-description">
            Sign in with your Google account to access the admin panel
          </p>
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            <FiLogIn />
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
