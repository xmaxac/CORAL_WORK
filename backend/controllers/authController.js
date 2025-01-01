import pool from "../database/db.js"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import dotenv from "dotenv"

dotenv.config()

export const register = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if ((!req.body.email || !req.body.password || !req.body.username || !req.body.name)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(req.body.email)) {
      return res.status(400).json({success: false, message: "Invalid Email Format"});
    }

    if (req.body.email) {
      const emailCount = await client.query(
        `SELECT COUNT(*) from users WHERE email = $1`,
        [req.body.email]
      );

      if (parseInt(emailCount.rows[0].count) > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Email already exists, please try again with a different email.'
        });
      }

    let userId;
    if (req.body.username) {
      const usernameCount = await client.query(
        `SELECT COUNT(*) from users WHERE username = $1`,
        [req.body.username]
      );

      if (parseInt(usernameCount.rows[0].count) > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Username already exists, please try again with a different username.'
        });
      }
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt)

      const userResult = await client.query(
        `INSERT INTO users (email, name, username, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name, username`,
        [req.body.email, req.body.name, req.body.username, hashedPassword]
      );
      userId = userResult.rows[0].id;

      const token = jwt.sign(
        { id: userId, email: userResult.rows[0].email},
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      await client.query('COMMIT');
      return res.status(201).json({
        success:true,
        user: userResult.rows[0],
        token: token
      });

    }
  }
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  } finally {
    client.release();
  }
};

export const login = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, password } = req.body;

    if ((!req.body.email || !req.body.password)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const userResult = await client.query(
      'SELECT id, email, username, password FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { id: user._id, email: userResult.rows[0].email},
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      user: {id: user.id, email: user.email, name: user.name, username: user.username},
      token: token
    });
  } catch (e) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  } finally {
    client.release();
  }
}

export const logout = async (req, res) => {
  try {
    // Handle token removal on the client side
    res.json({success: true, message: 'Logged out successfully'});
  } catch (e) {
    console.error('Logout error:', e);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    })
  }
}

export const getme = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;

    const userResult = await client.query(
      `SELECT id, email, name, username FROM users WHERE id = $1`,
      [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, username: user.username }
    });
  } catch (e) {
    console.error('GetMe error:', e);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    }); 
  } finally {
    client.release();
  }
}