import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, TrendingUp, User, Wallet } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center space-x-2 text-white font-bold text-xl">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            <span>TradePro</span>
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-gray-300">
            <Wallet className="h-4 w-4" />
            <span className="font-mono text-green-400">
              ${user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-gray-300">
            <User className="h-4 w-4" />
            <span>{user?.name}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;