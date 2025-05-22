// warm-up.js
import { Pool } from 'neon-serverless'; // Neon serverless driver for PostgreSQL

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Environment variable for the Neon DB connection string
});

export default async function handler(req, res) {
  try {
    // Try to connect and ping the database
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()'); // Simple query to keep the DB connection warm
    client.release();

    console.log('Connection is warm:', result.rows);
    res.status(200).json({ message: 'Warm-up complete' });
  } catch (error) {
    console.error('Error during warm-up:', error);
    res.status(500).json({ error: 'Failed to warm-up' });
  }
}
