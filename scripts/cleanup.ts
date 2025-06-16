// pages/api/search/cleanup.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { cleanupSearchSession } from '../../../lib/sessionStore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { sessionId } = req.body;

  try {
    await cleanupSearchSession(sessionId);
    res.status(200).json({ message: 'Session cleaned up' });
  } catch (error) {
    console.error('Failed to cleanup search session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
