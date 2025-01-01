import pool from "../database/db.js"
import bcrypt from "bcrypt"
import {v2 as cloudinary} from "cloudinary"

export const getUserProfile = async (req, res) => {
  const client = await pool.connect();
  const { username } = req.params;
  try {
    const user = await client.query("SELECT * FROM users WHERE username = $1", [username]);

    if (!user) {
      return res.status(404).json({success:false, message: "User not found" });
    }

    res.status(200).json(user.rows[0]);
  } catch (e) {
    console.error("Error in getUserProfile: ",e.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
}

export const followUnfollowUser = async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const userId = req.user.id;
  const {action} = req.body;

  try {

    if (id === userId.toString()) {
      return res.status(400).json({success:false, message: "You cannot follow/unfollow yourself"});
    }
    //follow user
    if (action === 'follow') {
      await client.query(
        'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
        [userId, id]
      );
      res.status(200).json({success:true, message: "User followed successfully"})
      await client.query(
        'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
        [id, `${req.user.username} started following you`, 'follow']
      )
    //unfollow user
    } else if (action === 'unfollow') {
      await client.query(
        'DELETE FROM follower WHERE follower_id = $1 AND following_id = $2',
        [userId, id]
      );
      res.status(200).json({success:true, message: "User unfollowed successfully"})
      await client.query(
        'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
        [id, `${req.user.username} unfollowed you`, 'unfollow']
      )
    } else {
      res.status(400).json({success:false, message: "Invalid action"})
    }
    //Send notification to user
  } catch (e) {
    console.error("Error in followUnfollowUser: ",e.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
}

// export const getNotifications = async (req, res) => {
//   const client = await pool.connect();
//   const userId = req.user.id;

//   try {
//     const notifications = await client.query(
//       'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
//       [userId]
//     );

//     res.status(200).json(notifications.rows);
//   } catch (e) {
//     console.error("Error in getNotifications: ",e.message);
//     res.status(500).send("Server Error");
//   } finally {
//     client.release();
//   }
// }

export const getSuggestedUsers = async (req, res) => {
  const userId = req.user.id;
  const client = await pool.connect();
  try {
    const usersFollowedByMeResult = await client.query(
      'SELECT following_id FROM followers WHERE follower_id = $1',
      [userId]
    );
    const usersFollowedByMe = usersFollowedByMeResult.rows[0].following;

    const usersResult = await client.query(
      'SELECT id, username FROM users WHERE id != $1 ORDER BY RANDOM() LIMIT 10',
      [userId]
    );
    const users = usersResult.rows;

    const filteredUsers = users.filter(user => !usersFollowedByMe.includes(user.id));
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach(user => delete user.password);

    res.status(200).json(suggestedUsers);
  } catch (e) {
    console.error("Error in getSuggestedUsers: ",e.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
}

export const updateUser = async (req, res) => {
  const client = await pool.connect();
  const { name, email, username, currentPassword, newPassword, bio, link} = req.body;
  let {profileImg, coverImg} = req.body;

  const userId = req.user.id;

  try {
    let user = await client.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (!user) {
      return res.status(404).json({success:false, message: "User not found" });
    }

    if ((!newPassword && currentPassword) || (newPassword && !currentPassword)) {
      return res.status(400).json({success:false, message: "Please enter both current and new password" });
    }

    if (currentPassword && newPassword) {
      const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
      if (!validPassword) {
        return res.status(400).json({success:false, message: "Invalid password" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({success:false, message: "New Password must be at least 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await client.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, userId]
      );
    }

    if (profileImg) {
      profileImgResult = await client.query(
        'SELECT profile_img FROM users WHERE id = $1',
        [userId]
      )
      if(profileImgResult.rows[0].profile_img) {
        await cloudinary.uploader.destroy(profileImgResult.rows[0].profile_img.split("/").pop().split(".")[0]);
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      coverImgResult = await client.query(
        'SELECT cover_img FROM users WHERE id = $1',
        [userId]
      )
      if(coverImgResult.rows[0].coverImg) {
        await cloudinary.uploader.destroy(coverImgResult.rows[0].coverImg.split("/").pop().split(".")[0]);
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    await client.query(
      'UPDATE users SET name = $1, email = $2, username = $3, bio = $4, link = $5, profile_img = $6, cover_img = $7 WHERE id = $8',
      [name, email, username, bio, link, profileImg, coverImg, userId]
    );

    return res.status(200).json({success:true, message: "User updated", user: {name, email, username, bio, link, profileImg, coverImg}});

  } catch (e) {

  } finally {
    client.release();
  }
}