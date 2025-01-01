import jwt from 'jsonwebtoken';
import pool from "../database/db.js"
import dotenv from "dotenv"

dotenv.config()

const auth = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const userResult = await client.query(
      `SELECT id, email, name, username FROM users WHERE id = $1`,
      [userId]
    );
    
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (e) {
    console.error('Authentication error:', e);
    return res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    client.release();
  }
};

export default auth;