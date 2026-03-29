import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ExpenseForm from './pages/employee/ExpenseForm';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base text-accent animate-pulse font-mono tracking-widest text-sm">INITIALIZING_SECURE_CONNECTION...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'MANAGER') return <Navigate to="/manager" replace />;
  return <Navigate to="/employee" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<RoleBasedRedirect />} />

          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route 
              path="/employee/*" 
              element={
                <PrivateRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
                   <Routes>
                      <Route path="/" element={<EmployeeDashboard />} />
                      <Route path="/new" element={<ExpenseForm />} />
                   </Routes>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/manager/*" 
              element={
                <PrivateRoute allowedRoles={['MANAGER']}>
                  <ManagerDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
