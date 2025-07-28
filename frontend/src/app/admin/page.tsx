'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Key, Shield, Save } from 'lucide-react';
import { apiRequest } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    apollo: '',
    telegram: '',
    gumroad: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchApiKeys();
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const response = await apiRequest('/api/admin/api-keys');
      setApiKeys(response.apiKeys);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('API key management requires deployment configuration updates');
  };

  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage system configuration and API integrations
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API Keys Management
            </CardTitle>
            <CardDescription>
              Configure external service integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API Key
                </label>
                <div className="text-sm text-gray-600">
                  Status: {apiKeys.openai}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apollo API Key
                </label>
                <div className="text-sm text-gray-600">
                  Status: {apiKeys.apollo}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telegram Bot Token
                </label>
                <div className="text-sm text-gray-600">
                  Status: {apiKeys.telegram}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gumroad API Key
                </label>
                <div className="text-sm text-gray-600">
                  Status: {apiKeys.gumroad}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                API keys are managed through deployment environment variables for security.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
