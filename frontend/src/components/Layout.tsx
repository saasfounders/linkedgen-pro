'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogOut, BarChart3, Users, MessageSquare, Settings, Target } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                LinkedGen Pro
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link href="/leads" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600">
                  <Users className="w-4 h-4 mr-2" />
                  Leads
                </Link>
                <Link href="/icp" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600">
                  <Target className="w-4 h-4 mr-2" />
                  ICP Profiles
                </Link>
                <Link href="/messages" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Link>
                <Link href="/settings" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
