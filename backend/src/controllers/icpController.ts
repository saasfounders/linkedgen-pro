import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../utils/database';
import { AuthRequest } from '../middleware/auth';

export const getICPProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await query(
      'SELECT * FROM icp_profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ profiles: result.rows });
  } catch (error) {
    console.error('Get ICP profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createICPProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, industries, geography } = req.body;

    if (!name || !industries || !geography) {
      return res.status(400).json({ error: 'Name, industries, and geography are required' });
    }

    const profileId = uuidv4();
    await query(
      'INSERT INTO icp_profiles (id, user_id, name, industries, geography) VALUES ($1, $2, $3, $4, $5)',
      [profileId, userId, name, industries, geography]
    );

    const result = await query(
      'SELECT * FROM icp_profiles WHERE id = $1',
      [profileId]
    );

    res.status(201).json({
      message: 'ICP profile created successfully',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Create ICP profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateICPProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, industries, geography } = req.body;

    const result = await query(
      'UPDATE icp_profiles SET name = $1, industries = $2, geography = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, industries, geography, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ICP profile not found' });
    }

    res.json({
      message: 'ICP profile updated successfully',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Update ICP profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteICPProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await query(
      'DELETE FROM icp_profiles WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ICP profile not found' });
    }

    res.json({ message: 'ICP profile deleted successfully' });
  } catch (error) {
    console.error('Delete ICP profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
