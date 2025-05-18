import pool from "../database/db.js"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const sendVerificationEmail = (email, code) => {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // var transporter = nodemailer.createTransport({
    //   host: 'email-smtp.us-east-1.amazonaws.com',
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD
    //   },
    // });

    const mailOptions = {
      from: 'verification@coralbase.net',
      to: email,
      subject: 'Coral Base Email Verification',
      text: `Your verification code is ${code}`,
      html: `<p>Your verification code is ${code}</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        reject(error);
      } else {
        console.log('Email sent:', info.response);
        resolve(info);
      }
    });
  });
};

// const storeCode = async (userId, code) => {
//   const client = await pool.connect();
//   try {
//     console.log(`Storing code: ${code} for userId: ${userId}`);
//     const res = await client.query('INSERT INTO codes(user_id, code, created_at) VALUES($1::UUID, $2, NOW()) RETURNING code', [userId, code]);
//     console.log('Code stored successfully:', res.rows[0].code);
//     return res.rows[0].code;
//   } catch (e) {
//     console.error('Store Code error:', e);
//     return null; // Return null instead of throwing 0
//   }
// }

export const register = async (req, res) => {
  console.log('Registering user:', req.body);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if ((!req.body.email || !req.body.password || !req.body.username || !req.body.name || !req.body.role)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ success: false, message: "Invalid Email Format" });
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
          `INSERT INTO users (email, name, username, password, is_verified, role)
        VALUES ($1, $2, $3, $4, false, $5)
        RETURNING id, email, name, username, role`,
          [req.body.email, req.body.name, req.body.username, hashedPassword, req.body.role]
        );

        const userId = userResult.rows[0].id;

        // 8. Generate and store verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await client.query(
          'INSERT INTO codes (user_id, code, created_at) VALUES ($1, $2, NOW()) RETURNING code',
          [userId, code]
        );

        // 9. Send verification email
        try {
          await sendVerificationEmail(req.body.email, code);
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          // Continue with registration even if email fails
        }

        const token = jwt.sign(
          { id: userId, email: userResult.rows[0].email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        await client.query('COMMIT');
        return res.status(201).json({
          success: true,
          user: userResult.rows[0],
          token: token
        });

      }
    }
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Registration error:', e);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  } finally {
    client.release();
  }
};

export const verifyEmail = async (req, res) => {
  const client = await pool.connect();
  const { code, email } = req.params;

  try {
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email'
      });
    }
    const userId = userResult.rows[0].id;

    const storedCodeResult = await client.query(
      'SELECT code FROM codes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (storedCodeResult.rows.length === 0 || storedCodeResult.rows[0].code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    await client.query(
      `UPDATE users SET is_verified = true WHERE email = $1`,
      [email]
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (e) {
    console.error('Verify Email error:', e);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  } finally {
    client.release();
  }
}

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
      'SELECT id, email, username, password, is_verified FROM users WHERE email = $1',
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

    if (user.is_verified === false) {
      return res.status(401).json({
        success: false,
        message: 'Email not verified'
      });
    }

    await client.query(
      'DELETE FROM codes WHERE user_id = $1',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: userResult.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, username: user.username },
      token: token
    });
  } catch (e) {
    console.error('Login error:', e);
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
    res.json({ success: true, message: 'Logged out successfully' });
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
      `SELECT id, email, name, username, profile_image, cover_image, bio, link, role FROM users WHERE id = $1`,
      [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, username: user.username, profile_image: user.profile_image, cover_image: user.cover_image, bio: user.bio, link: user.link, role: user.role }
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