// pages/api/search/init-db.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import initializeDatabase from '../../../lib/db/init';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await initializeDatabase();
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(500).json({ 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
}
