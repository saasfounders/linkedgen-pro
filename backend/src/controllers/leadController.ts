import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../utils/database';
import { AuthRequest } from '../middleware/auth';

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await query(
      'SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ leads: result.rows });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateLeads = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { icpProfileId, count = 10 } = req.body;

    const icpResult = await query(
      'SELECT * FROM icp_profiles WHERE id = $1 AND user_id = $2',
      [icpProfileId, userId]
    );

    if (icpResult.rows.length === 0) {
      return res.status(404).json({ error: 'ICP profile not found' });
    }

    const icpProfile = icpResult.rows[0];

    const mockLeads: any[] = [];
    for (let i = 0; i < count; i++) {
      const leadId = uuidv4();
      const mockLead = {
        id: leadId,
        user_id: userId,
        name: `Lead ${i + 1}`,
        company: `Company ${i + 1}`,
        industry: icpProfile.industries[0] || 'Technology',
        score: Math.round((Math.random() * 4 + 6) * 10) / 10, // Score between 6.0-10.0
      };

      await query(
        'INSERT INTO leads (id, user_id, name, company, industry, score) VALUES ($1, $2, $3, $4, $5, $6)',
        [leadId, userId, mockLead.name, mockLead.company, mockLead.industry, mockLead.score]
      );

      mockLeads.push(mockLead);
    }

    res.json({ 
      message: `Generated ${count} leads successfully`,
      leads: mockLeads 
    });
  } catch (error) {
    console.error('Generate leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, company, industry, score } = req.body;

    const result = await query(
      'UPDATE leads SET name = $1, company = $2, industry = $3, score = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [name, company, industry, score, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead updated successfully', lead: result.rows[0] });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await query(
      'DELETE FROM leads WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
