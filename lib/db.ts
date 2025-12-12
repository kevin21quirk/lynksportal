import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    // Convert SQLite ? placeholders to Postgres $1, $2, etc.
    let paramIndex = 1;
    const postgresQuery = text.replace(/\?/g, () => `$${paramIndex++}`);
    
    // Convert SQLite AUTOINCREMENT to SERIAL (already done in schema)
    // Convert SQLite DATETIME to TIMESTAMP (already done in schema)
    // Convert SQLite BOOLEAN 0/1 to true/false
    const convertedParams = params?.map(p => {
      if (p === 0 || p === 1) {
        // Check if this is likely a boolean based on context
        if (text.toLowerCase().includes('is_published') || 
            text.toLowerCase().includes('is_visible') || 
            text.toLowerCase().includes('is_closed')) {
          return p === 1;
        }
      }
      return p;
    });
    
    const result: QueryResult = await client.query(postgresQuery, convertedParams);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(text, params);
  return results.length > 0 ? results[0] : null;
}

export async function execute(text: string, params?: any[]): Promise<number> {
  const client = await pool.connect();
  try {
    let paramIndex = 1;
    const postgresQuery = text.replace(/\?/g, () => `$${paramIndex++}`);
    
    const result: QueryResult = await client.query(postgresQuery, params);
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}

export async function insert(text: string, params?: any[]): Promise<number> {
  const client = await pool.connect();
  try {
    let paramIndex = 1;
    const postgresQuery = text.replace(/\?/g, () => `$${paramIndex++}`);
    
    // Add RETURNING id to get the inserted ID
    const queryWithReturning = postgresQuery.includes('RETURNING') 
      ? postgresQuery 
      : postgresQuery + ' RETURNING id';
    
    const result: QueryResult = await client.query(queryWithReturning, params);
    return result.rows[0]?.id || 0;
  } finally {
    client.release();
  }
}

export default {
  query,
  queryOne,
  execute,
  insert
};
