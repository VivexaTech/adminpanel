import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Auth/Login';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Invoices from './pages/Invoices';
import Portfolio from './pages/Portfolio';
import Certificates from './pages/Certificates';
import EmployeeManagement from './pages/EmployeeManagement';
import EmployeePortal from './pages/EmployeePortal';
import Users from './pages/Users';
import './App.css';

// Admin-only route wrapper
const AdminRoute = ({ children }) => {
  const { isSuperAdmin, staffData, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Only super admin can access admin routes
  if (!isSuperAdmin() || staffData) {
    return <Navigate to="/my-portal" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { currentUser, isAuthorized, staffData, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          currentUser && isAuthorized 
            ? (staffData ? <Navigate to="/my-portal" replace /> : <Navigate to="/" replace />)
            : <Login />
        }
      />
      <Route
        path="/my-portal"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EmployeePortal />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/certificates" element={<Certificates />} />
                  <Route path="/employees" element={<EmployeeManagement />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
