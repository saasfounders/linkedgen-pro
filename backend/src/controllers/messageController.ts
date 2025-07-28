import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { query } from '../utils/database';
import { AuthRequest } from '../middleware/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId } = req.params;
    const userId = req.user?.id;

    const leadResult = await query(
      'SELECT * FROM leads WHERE id = $1 AND user_id = $2',
      [leadId, userId]
    );

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const result = await query(
      'SELECT * FROM messages WHERE lead_id = $1 AND user_id = $2 ORDER BY sent_at DESC',
      [leadId, userId]
    );

    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { leadId, messageType = 'initial', style = 'professional' } = req.body;

    const leadResult = await query(
      'SELECT * FROM leads WHERE id = $1 AND user_id = $2',
      [leadId, userId]
    );

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadResult.rows[0];

    const prompt = `Generate a professional LinkedIn message for ${lead.name} at ${lead.company}.
    Industry: ${lead.industry}
    Message type: ${messageType}
    Style: ${style}
    
    The message should be personalized, engaging, and focused on value proposition for lead generation.
    Keep it under 300 characters for LinkedIn messaging limits.`;

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert LinkedIn outreach specialist. Generate personalized, professional messages that get responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const generatedContent = completion.choices[0]?.message?.content || 'Failed to generate message';

      res.json({
        message: 'Message generated successfully',
        content: generatedContent,
        leadId,
        messageType
      });
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      const fallbackMessage = `Hi ${lead.name}, I noticed your work at ${lead.company} in the ${lead.industry} industry. I'd love to connect and share some insights that might be valuable for your business growth. Best regards!`;
      
      res.json({
        message: 'Message generated successfully (fallback)',
        content: fallbackMessage,
        leadId,
        messageType
      });
    }
  } catch (error) {
    console.error('Generate message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { content, leadId, messageType } = req.body;

    const leadResult = await query(
      'SELECT * FROM leads WHERE id = $1 AND user_id = $2',
      [leadId, userId]
    );

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const messageId = uuidv4();
    await query(
      'INSERT INTO messages (id, lead_id, user_id, content, message_type, sent_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [messageId, leadId, userId, content, messageType, new Date()]
    );

    res.json({
      message: 'Message sent successfully',
      messageId,
      sentAt: new Date()
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
