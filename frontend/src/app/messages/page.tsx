'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Plus, User, Clock, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/utils';

interface Message {
  id: string;
  lead_id: string;
  lead_name: string;
  content: string;
  status: 'draft' | 'sent' | 'replied';
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    leadId: '',
    content: ''
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await apiRequest('/api/messages');
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMessage = async (leadId: string) => {
    setGenerating(true);
    try {
      const response = await apiRequest('/api/messages/generate', {
        method: 'POST',
        body: JSON.stringify({ leadId })
      });
      
      if (response.message) {
        setFormData({
          leadId,
          content: response.message.content
        });
        setShowForm(true);
      }
    } catch (error) {
      console.error('Failed to generate message:', error);
    } finally {
      setGenerating(false);
    }
  };

  const sendMessage = async (messageId: string) => {
    try {
      await apiRequest(`/api/messages/${messageId}/send`, {
        method: 'POST'
      });
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sent' as const } : msg
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (response.message) {
        setMessages(prev => [response.message, ...prev]);
        setFormData({ leadId: '', content: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to create message:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />;
      case 'replied':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-blue-600 bg-blue-100';
      case 'replied':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="mt-2 text-gray-600">
                Manage your AI-generated LinkedIn outreach messages
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Message
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Message</CardTitle>
              <CardDescription>
                Write or generate an AI-powered LinkedIn message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead ID
                  </label>
                  <Input
                    value={formData.leadId}
                    onChange={(e) => setFormData(prev => ({ ...prev, leadId: e.target.value }))}
                    placeholder="Enter lead ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content
                  </label>
                  <textarea
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your message content..."
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Create Message
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => generateMessage(formData.leadId)}
                    disabled={!formData.leadId || generating}
                  >
                    {generating ? 'Generating...' : 'Generate AI Message'}
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
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-500 mb-4">
                  Create your first AI-generated message to start outreach
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Message
                </Button>
              </div>
            ) : (
              messages.map((message) => (
                <Card key={message.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <CardTitle className="text-lg">{message.lead_name}</CardTitle>
                          <CardDescription>
                            {new Date(message.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                          {getStatusIcon(message.status)}
                          <span className="ml-1 capitalize">{message.status}</span>
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex space-x-2">
                      {message.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => sendMessage(message.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        View Lead
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
