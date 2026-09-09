import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Batches from './pages/Batches';
import Customers from './pages/Customers';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute><Layout><POS /></Layout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
      <Route path="/batches" element={<ProtectedRoute><Layout><Batches /></Layout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
