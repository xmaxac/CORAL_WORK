import jwt from 'jsonwebtoken';
import pool from "../database/db.js";
import dotenv from 'dotenv';
dotenv.config();

const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const isValidTokenFormat = (token) => token && typeof token === 'string' && token.length > 0;

const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });

const auth = async (req, res, next) => {
  let client;

  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
    const queryToken = req.query.token;
    const token = bearerToken || queryToken;

    if (!isValidTokenFormat(token)) {
      return res.status(401).json({ success: false, message: 'Authentication token is required' });
    }

    const decoded = await verifyToken(token);
    const userId = decoded.id;

    // Check Cache
    const cachedUser = userCache.get(userId);
    if (cachedUser && cachedUser.timestamp > Date.now() - CACHE_TTL) {
      req.user = cachedUser.user;
      req.token = token;
      return next();
    }

    client = await pool.connect();

    // Fetch User from DB
    const userResult = await client.query(
      `SELECT id, email, name, username, role, last_active 
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [userId]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    // Update Cache and User's Last Active Timestamp
    userCache.set(userId, { user, timestamp: Date.now() });
    await client.query(`UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1`, [userId]);

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    console.error('Authentication error:', e);

    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    return res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    if (client) client.release();
  }
};

// Periodic Cache Cleanup
setInterval(() => {
  const now = Date.now();
  for (const [userId, userData] of userCache.entries()) {
    if (userData.timestamp < now - CACHE_TTL) {
      userCache.delete(userId);
    }
  }
}, CACHE_TTL / 2);

export default auth;
