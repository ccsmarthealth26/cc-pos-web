import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
