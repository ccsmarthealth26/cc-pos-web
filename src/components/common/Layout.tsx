import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 text-white p-4 flex justify-between items-center shadow">
        <div className="flex gap-4">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/pos" className="hover:underline">POS</Link>
          <Link to="/products" className="hover:underline">Products</Link>
          <Link to="/batches" className="hover:underline">Batches</Link>
          <Link to="/customers" className="hover:underline">Customers</Link>
        </div>
        <div className="flex items-center gap-4">
          <span>{profile?.full_name} ({profile?.role})</span>
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </nav>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
};

export default Layout;
