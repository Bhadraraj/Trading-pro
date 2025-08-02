import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  History, 
  Settings, 
  Shield, 
  Award, 
  Bell, 
  HelpCircle,
  Menu,
  X,
  Home,
  PieChart,
  Activity,
  Target,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      description: 'Overview & Analytics'
    },
    {
      title: 'Trading',
      icon: TrendingUp,
      path: '/dashboard/trading',
      description: 'Advanced Trading Panel'
    },
    {
      title: 'Portfolio',
      icon: PieChart,
      path: '/dashboard/portfolio',
      description: 'Portfolio Management'
    },
    {
      title: 'Orders',
      icon: History,
      path: '/dashboard/orders',
      description: 'Order History & Management'
    },
    {
      title: 'Market Data',
      icon: BarChart3,
      path: '/dashboard/market',
      description: 'Charts & Market Analysis'
    },
    {
      title: 'Positions',
      icon: Target,
      path: '/dashboard/positions',
      description: 'Open Positions'
    },
    {
      title: 'Statistics',
      icon: Award,
      path: '/dashboard/statistics',
      description: 'Trading Performance'
    },
    {
      title: 'Risk Management',
      icon: Shield,
      path: '/dashboard/risk',
      description: 'Risk Controls & Limits'
    },
    {
      title: 'Education',
      icon: BookOpen,
      path: '/dashboard/education',
      description: 'Trading Resources'
    },
  ];

  const bottomMenuItems = [
    {
      title: 'Notifications',
      icon: Bell,
      path: '/dashboard/notifications',
      description: 'Alerts & Updates'
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
      description: 'Account Settings'
    },
    {
      title: 'Help',
      icon: HelpCircle,
      path: '/dashboard/help',
      description: 'Support & Documentation'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-white">TradePro</h1>
              <p className="text-xs text-gray-400">Advanced Trading</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="mt-3 p-2 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Balance</span>
              <div className="flex items-center space-x-1">
                <Wallet className="h-3 w-3 text-green-400" />
                <span className="text-sm font-mono text-green-400">
                  ${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${active 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                  `} />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className={`text-xs ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-gray-700 p-3 space-y-1">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${active 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <Icon className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                `} />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className={`text-xs ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              TradePro v1.0.0
            </p>
            <p className="text-xs text-gray-500 mt-1">
              © 2025 All rights reserved
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;