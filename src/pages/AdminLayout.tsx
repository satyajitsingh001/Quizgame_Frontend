import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Play,
  Users,
  HelpCircle,
  Settings
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { role, isLoading } = useAuth();

  if (isLoading && !role) {
    return <div className="text-center py-16 text-slate-500">Checking authorization...</div>;
  }

  if (role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/control', label: 'Live Control Room', icon: Play },
    { to: '/admin/teams', label: 'Team Management', icon: Users },
    { to: '/admin/questions', label: 'Question Bank', icon: HelpCircle },
    { to: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Main Admin Content Outlet */}
      <Outlet />
    </div>
  );
};
