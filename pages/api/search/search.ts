import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const searchText = req.body.query;
    
    if (!searchText?.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log('Performing basic search for:', searchText);

    // Basic text search using ILIKE
    const results = await query(`
      SELECT 
        id,
        title,
        content,
        url,
        category,
        "Date" as date,
        description,
        export
      FROM aildb
      WHERE 
        title ILIKE $1 OR
        content ILIKE $1 OR
        description ILIKE $1
      ORDER BY "Date" DESC
      LIMIT 10
    `, [`%${searchText}%`]);

    console.log(`Found ${results.rows.length} results`);

    return res.status(200).json(results.rows);

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
}
