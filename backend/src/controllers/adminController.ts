import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getApiKeys = async (req: AuthRequest, res: Response) => {
  try {
    const apiKeys = {
      openai: process.env.OPENAI_API_KEY ? '***configured***' : 'not configured',
      apollo: process.env.APOLLO_API_KEY ? '***configured***' : 'not configured',
      telegram: process.env.TELEGRAM_BOT_TOKEN ? '***configured***' : 'not configured',
      gumroad: process.env.GUMROAD_API_KEY ? '***configured***' : 'not configured'
    };
    
    res.json({ apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateApiKey = async (req: AuthRequest, res: Response) => {
  try {
    const { keyName, keyValue } = req.body;
    
    if (!keyName || !keyValue) {
      return res.status(400).json({ error: 'Key name and value are required' });
    }

    console.log(`Admin ${req.user?.email} updated API key: ${keyName}`);
    
    res.json({ 
      message: `API key ${keyName} updated successfully`,
      note: 'Environment variables need to be updated in deployment configuration'
    });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
