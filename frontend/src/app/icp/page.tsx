'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Target, Plus, Edit, Trash2, Building, Globe } from 'lucide-react';
import { apiRequest } from '@/lib/utils';

interface ICPProfile {
  id: string;
  name: string;
  industries: string[];
  geography: string[];
  created_at: string;
}

export default function ICPPage() {
  const [profiles, setProfiles] = useState<ICPProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industries: '',
    geography: ''
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await apiRequest('/api/icp');
      setProfiles(response.profiles || []);
    } catch (error) {
      console.error('Failed to fetch ICP profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('/api/icp', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          industries: formData.industries.split(',').map(i => i.trim()),
          geography: formData.geography.split(',').map(g => g.trim())
        })
      });
      
      if (response.profile) {
        setProfiles(prev => [response.profile, ...prev]);
        setFormData({ name: '', industries: '', geography: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to create ICP profile:', error);
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      await apiRequest(`/api/icp/${id}`, { method: 'DELETE' });
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete ICP profile:', error);
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ICP Profiles</h1>
              <p className="mt-2 text-gray-600">
                Define your ideal customer profiles for targeted lead generation
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New ICP Profile</CardTitle>
              <CardDescription>
                Define the characteristics of your ideal customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Tech Startups, Enterprise SaaS"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industries (comma-separated)
                  </label>
                  <Input
                    value={formData.industries}
                    onChange={(e) => setFormData(prev => ({ ...prev, industries: e.target.value }))}
                    placeholder="e.g., Technology, SaaS, Fintech"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geography (comma-separated)
                  </label>
                  <Input
                    value={formData.geography}
                    onChange={(e) => setFormData(prev => ({ ...prev, geography: e.target.value }))}
                    placeholder="e.g., United States, Europe, North America"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Create Profile
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ICP profiles found</h3>
                <p className="text-gray-500 mb-4">
                  Create your first ICP profile to start generating targeted leads
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Profile
                </Button>
              </div>
            ) : (
              profiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          Created {new Date(profile.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteProfile(profile.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <Building className="h-4 w-4 mr-2" />
                          Industries
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {profile.industries.map((industry, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <Globe className="h-4 w-4 mr-2" />
                          Geography
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {profile.geography.map((geo, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              {geo}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        Generate Leads
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
