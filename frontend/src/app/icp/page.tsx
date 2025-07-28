'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Target, Plus, Edit, Trash2, Building, Globe, MessageCircle, Send, Users, Briefcase } from 'lucide-react';
import { apiRequest } from '@/lib/utils';

interface ICPProfile {
  id: string;
  name: string;
  industries: string[];
  geography: string[];
  position_levels?: string[];
  company_sizes?: string[];
  created_at: string;
}

interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface AIConversationState {
  messages: ConversationMessage[];
  currentStep: string;
  isComplete: boolean;
  isLoading: boolean;
}

export default function ICPPage() {
  const [profiles, setProfiles] = useState<ICPProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    industries: '',
    geography: ''
  });
  const [aiConversation, setAIConversation] = useState<AIConversationState>({
    messages: [],
    currentStep: 'greeting',
    isComplete: false,
    isLoading: false
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

  const startAIConversation = () => {
    setShowAIChat(true);
    setShowForm(false);
    setAIConversation({
      messages: [{
        role: 'assistant',
        content: 'Привет! Я помогу вам создать профиль идеального клиента (ICP). Я задам несколько вопросов о ваших целевых клиентах, и на основе ваших ответов создам детальный профиль. Готовы начать?'
      }],
      currentStep: 'greeting',
      isComplete: false,
      isLoading: false
    });
  };

  const sendMessage = async () => {
    if (!userInput.trim() || aiConversation.isLoading) return;

    const newMessages = [
      ...aiConversation.messages,
      { role: 'user' as const, content: userInput }
    ];

    setAIConversation(prev => ({
      ...prev,
      messages: newMessages,
      isLoading: true
    }));

    setUserInput('');

    try {
      const response = await apiRequest('/api/icp/generate-ai', {
        method: 'POST',
        body: JSON.stringify({
          conversation: newMessages,
          currentStep: aiConversation.currentStep
        })
      });

      const assistantMessage = {
        role: 'assistant' as const,
        content: response.message
      };

      setAIConversation(prev => ({
        ...prev,
        messages: [...newMessages, assistantMessage],
        currentStep: response.nextStep,
        isComplete: response.isComplete,
        isLoading: false
      }));

      if (response.isComplete && response.profile) {
        setProfiles(prev => [response.profile, ...prev]);
        setTimeout(() => {
          setShowAIChat(false);
          setAIConversation({
            messages: [],
            currentStep: 'greeting',
            isComplete: false,
            isLoading: false
          });
        }, 3000);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setAIConversation(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
            <div className="flex space-x-2">
              <Button 
                onClick={startAIConversation}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Создать с ИИ
              </Button>
              <Button 
                onClick={() => setShowForm(!showForm)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать вручную
              </Button>
            </div>
          </div>
        </div>

        {showAIChat && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Создание профиля с ИИ-помощником
              </CardTitle>
              <CardDescription>
                Ответьте на вопросы ИИ, и он создаст идеальный профиль клиента
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-80 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                  {aiConversation.messages.map((message, index) => (
                    <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-800 border'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {aiConversation.isLoading && (
                    <div className="text-left mb-4">
                      <div className="inline-block bg-white text-gray-800 border px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>ИИ печатает...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {!aiConversation.isComplete && (
                  <div className="flex space-x-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Введите ваш ответ..."
                      disabled={aiConversation.isLoading}
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!userInput.trim() || aiConversation.isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAIChat(false)}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Создать профиль вручную</CardTitle>
              <CardDescription>
                Определите характеристики ваших идеальных клиентов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название профиля
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="например, IT стартапы, Корпоративный SaaS"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Отрасли (через запятую)
                  </label>
                  <Input
                    value={formData.industries}
                    onChange={(e) => setFormData(prev => ({ ...prev, industries: e.target.value }))}
                    placeholder="например, Технологии, SaaS, Финтех"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    География (через запятую)
                  </label>
                  <Input
                    value={formData.geography}
                    onChange={(e) => setFormData(prev => ({ ...prev, geography: e.target.value }))}
                    placeholder="например, Украина, Европа, Северная Америка"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Создать профиль
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    Отмена
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Профили ICP не найдены</h3>
                <p className="text-gray-500 mb-4">
                  Создайте свой первый профиль ICP для генерации целевых лидов
                </p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={startAIConversation} className="bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Создать с ИИ
                  </Button>
                  <Button onClick={() => setShowForm(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Создать вручную
                  </Button>
                </div>
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
                      {profile.position_levels && profile.position_levels.length > 0 && (
                        <div>
                          <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                            <Users className="h-4 w-4 mr-2" />
                            Уровни позиций
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {profile.position_levels.map((level, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {level}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <Building className="h-4 w-4 mr-2" />
                          Отрасли
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
                      
                      {profile.company_sizes && profile.company_sizes.length > 0 && (
                        <div>
                          <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                            <Briefcase className="h-4 w-4 mr-2" />
                            Размер компаний
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {profile.company_sizes.map((size, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <Globe className="h-4 w-4 mr-2" />
                          География
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
                        Генерировать лиды
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
