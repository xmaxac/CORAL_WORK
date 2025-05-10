import pool from "../database/db.js"
import bcrypt from "bcryptjs"
// import { cacheMiddleware, deleteCacheByPattern } from "../middleware/cache.js";
import { uploadToS3, deleteFromS3 } from "../config/s3.js";

const processImageUpload = async (fileBuffer, existingImageUrl = null, userId) => {
  if (!fileBuffer) return existingImageUrl;

  if (existingImageUrl) {
    try {
      await deleteFromS3(existingImageUrl);
    } catch (e) {
      console.error('Error deleting existing image:', e.message);
    }
  }

  try {
    const fileName = `${userId}-profile-${Date.now()}.jpeg`;
    const imageUrl = await uploadToS3(fileBuffer, `users/${userId}`, fileName);
    return imageUrl;
  } catch (e) {
    console.error('Error uploading image:', e);
    throw new Error('Error uploading image:', e);
  }
};

export const getUserProfile = async (req, res) => {
    const client = await pool.connect();
    const { username } = req.params;
    try {
      const userResult = await client.query(
        `SELECT
          u.id, u.username, u.name, u.bio, u.link, u.profile_image, u.cover_image, u.created_at
        FROM users u
        WHERE u.username = $1
        GROUP BY u.id`,
        [username || null]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const user = userResult.rows[0];
      delete user.password;

      res.status(200).json(user);
    } catch (e) {
      console.error("Error in getUserProfile: ", e.message);
      res.status(500).send("Server Error");
    } finally {
      client.release();
    }
  }

export const updateUser = async (req, res) => {
  const client = await pool.connect();
  const { name, email, username, currentPassword, newPassword, bio, link } = req.body;
  let profileImg = req.files?.profileImg ? req.files.profileImg[0].buffer : null;
  let coverImg = req.files?.coverImg ? req.files.coverImg[0].buffer : null;

  const userId = req.user.id;

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userResult.rows[0];

    if ((!newPassword && currentPassword) || (newPassword && !currentPassword)) {
      return res.status(400).json({ success: false, message: "Please enter both current and new password" });
    }

    if (currentPassword && newPassword) {
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ success: false, message: "Invalid password" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "New Password must be at least 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await client.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, userId]
      );
    }

    try {
      if (profileImg) {
        profileImg = await processImageUpload(profileImg, user.profile_image, userId);
      }
      if (coverImg) {
        coverImg = await processImageUpload(coverImg, user.cover_image, userId);
      }
    } catch (e) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: "Image upload failed" });
    }

    const updatedUser = await client.query(
      `UPDATE users
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          username = COALESCE($3, username),
          bio = COALESCE($4, bio),
          link = COALESCE($5, link),
          profile_image = COALESCE($6, profile_image),
          cover_image = COALESCE($7, cover_image),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id, name, email, username, bio, link, profile_image, cover_image, created_at, updated_at`,
      [name, email, username, bio, link, profileImg, coverImg, userId]
    );

    await client.query("COMMIT");

    const updatedUserData = updatedUser.rows[0];
    const key = `userProfile:/api/user/profile/${updatedUserData.username}`;
    // await deleteCacheByPattern(key)
    console.log('Cache cleared');

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUserData,
      cover: coverImg,
      profile: profileImg,
    });

  } catch (e) {
    await client.query("ROLLBACK");
    if (e.constraint === 'users_username_key') {
      return res.status(400).json({ success: false, message: "Username is already taken" });
    }
    if (e.constraint === 'users_email_key') {
      return res.status(400).json({ success: false, message: "Email is already taken" });
    }
    console.error("Error in updateUser: ", e.message);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    client.release();
  }
};