import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  LogOut, 
  User, 
  Wallet, 
  Bell, 
  Settings,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Market Status */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-900 bg-opacity-30 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Markets Open</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-gray-300">BTC:</span>
              <span className="text-green-400 font-mono">$43,250.50</span>
              <span className="text-green-400">+2.45%</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Balance */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg">
            <Wallet className="h-4 w-4 text-green-400" />
            <span className="text-gray-300 text-sm">Balance:</span>
            <span className="text-green-400 font-mono font-semibold">
              ${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.tradingLevel || 'Basic'}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <hr className="my-2 border-gray-700" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;