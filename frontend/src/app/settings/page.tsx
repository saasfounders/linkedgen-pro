'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bell, User, Save } from 'lucide-react';

export default function SettingsPage() {
  
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    telegramNotifications: false,
    leadGeneration: true,
    messageReplies: true
  });


  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.newPassword !== profile.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      console.log('Updating profile:', profile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Saving notification preferences:', notifications);
      alert('Notification preferences saved!');
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your account information and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <Input
                    value={profile.username}
                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={profile.currentPassword}
                    onChange={(e) => setProfile(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={profile.newPassword}
                    onChange={(e) => setProfile(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={profile.confirmPassword}
                    onChange={(e) => setProfile(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSubmit} className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={notifications.telegramNotifications}
                      onChange={(e) => setNotifications(prev => ({ ...prev, telegramNotifications: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Telegram Notifications</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={notifications.leadGeneration}
                      onChange={(e) => setNotifications(prev => ({ ...prev, leadGeneration: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Lead Generation Updates</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={notifications.messageReplies}
                      onChange={(e) => setNotifications(prev => ({ ...prev, messageReplies: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Message Reply Alerts</span>
                  </label>
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
