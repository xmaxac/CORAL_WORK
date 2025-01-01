import pool from "../database/db.js";
import {v2 as cloudinary} from "cloudinary"

export const createReport = async (req, res) => {
  const client = await pool.connect();
  const { latitude, longitude, countryCode, description, reportDate} = req.body;
  let { img } = req.body;
  const userId = req.user.id;

  try {

    const user = await client.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (!user) {
      return res.status(404).json({success:false, message: "User not found" });
    }

    if (!description || !latitude || !longitude || !countryCode) {
      return res.status(400).json({success: false, message: "Please fill in all required fields"});
    }
    
    const reportResult = await client.query(
      `INSERT INTO reports
      (user_id, latitude, longitude, country_code, description, report_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [userId, latitude, longitude,countryCode, description, reportDate]
    );

    const reportId = reportResult.rows[0].id;

    //add photo is included
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;

      await client.query(
        `INSERT INTO report_photos (photo_url, report_id) VALUES ($1, $2)`,
        [img, reportId]
      );
    }

    res.json({success: true, report: {id: reportId, user_id: userId, latitude, longitude, country_code: countryCode, description, report_date: reportDate, img: img}});
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Failed to create a report", e)
    res.status(500).json({success: false , message: 'Failed to create report'})
  } finally {
    client.release()
  }
}

export const deleteReport = async (req, res) => {
  const client = await pool.connect();
  const reportId = req.params.id;
  const userId = req.user.id;
  try {
    const report = await client.query(
      "SELECT * FROM reports WHERE id = $1", 
      [reportId]
    );
    if (!report) {
      return res.status(404).json({success: false, message: "Report not found"});
    }

    if(userId !== report.rows[0].user_id) {
      return res.status(401).json({success: false, message: "You are not authorized to delete this report"});
    }

    if (report.rows[0].photo_url) {
      await cloudinary.uploader.destroy(report.rows[0].split("/").pop().split(".")[0]);
      
      await client.query(
        "DELETE FROM report_photos WHERE report_id = $1",
        [reportId]
      );
    }

    await client.query("DELETE FROM reports WHERE id = $1", [reportId]);

    res.json({success: true, message: "Report deleted successfully"});
  } catch (e) {
    console.error("Failed to delete report", e);
    res.status(500).json({success: false, message: "Failed to delete report"});
  } finally {
    client.release();
  }
}

export const commentOnReport = async (req, res) => {
  const {text} = req.body;
  const {reportId} = req.params;
  const userId = req.user.id;
  const client = await pool.connect();

  try {
    if (!text) {
      return res.status(400).json({success: false, message: "Text Field is required"});
    }
    const report = await pool.query("SELECT * FROM reports WHERE id = $1", [reportId]);
    if(!report) {
      return res.status(404).json({success: false, message: "Report not found"});
    }
    
    const comment = await client.query(
      `INSERT INTO report_comments (text, user_id, report_id)
      VALUES ($1, $2, $3)
      RETURNING id`,
      [text, userId, reportId]
    );

    res.status(201).json({success: true, comment: {id: comment.rows[0].id, text, user_id: userId, report_id: reportId}});
  } catch (e) {
    console.error("Failed to comment on report", e);
    res.status(500).json({success: false, message: "Failed to comment on report"});
  } finally {
    client.release();
  }
}

export const likeUnlikeReport = async (req, res) => {
  const userId = req.user.id;
  const {reportId} = req.params;

  try {
    const report = await pool.query("SELECT * FROM reports WHERE id = $1", [reportId]);
    if (!report) {
      return res.status(404).json({success: false, message: "Report not found"});
    }

    const like = await pool.query(
      `SELECT * FROM report_likes WHERE user_id = $1 AND report_id = $2`,
      [userId, reportId]
    );

    if(like) {
      await pool.query(
        `DELETE FROM report_likes WHERE user_id = $1 AND report_id = $2`,
        [userId, reportId]
      );
      return res.json({success: true, message: "Report unliked successfully"});
    } else {
      await pool.query(
        `INSERT INTO report_likes (user_id, report_id) VALUES ($1, $2)`,
        [userId, reportId]
      );

      await pool.query(
        `INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)`,
        [report.rows[0].user_id, `${req.user.username} liked your report`, 'like']
      );

      return res.json({success: true, message: "Report liked successfully"});
    }
  } catch (e) {
    console.error("Failed to like/unlike report", e);
    res.status(500).json({success: false, message: "Failed to like/unlike report"});
  } finally {
    client.release();
  }
}

export const getAllReports = async (req, res) => { 
  const client = await pool.connect();
  const userId = req.user.id;
  try {
    const reports = await client.query(`
      SELECT 
        r.*, 
        u.username, u.profile_pic, u.name,
        c.id AS comment_id, c.text AS comment_text, c.user_id AS comment_user_id,
        cu.username AS comment_username, cu.profile_pic AS comment_profile_pic, cu.name AS comment_name
      FROM reports r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN report_comments c ON r.id = c.report_id
      LEFT JOIN users cu ON c.user_id = cu.id
      WHERE r.user_id = $1
      ORDER BY r.report_date DESC
    `, [userId]);

    const reportsMap = new Map();

    reports.rows.forEach(row => {
      if (!reportsMap.has(row.id)) {
        reportsMap.set(row.id, {
          id: row.id,
          user_id: row.user_id,
          latitude: row.latitude,
          longitude: row.longitude,
          country_code: row.country_code,
          description: row.description,
          report_date: row.report_date,
          user: {
            username: row.username,
            profile_pic: row.profile_pic,
            name: row.name
          },
          comments: []
        });
      }

      if (row.comment_id) {
        reportsMap.get(row.id).comments.push({
          id: row.comment_id,
          text: row.comment_text,
          user_id: row.comment_user_id,
          user: {
            username: row.comment_username,
            profile_pic: row.comment_profile_pic,
            name: row.comment_name
          }
        });
      }
    });

    const reportsWithDetails = Array.from(reportsMap.values());

    if (reportsWithDetails.length === 0) {
      return res.status(404).json({success: false, message: "No reports found"});
    }

    res.json({success: true, reports: reportsWithDetails});

  } catch (e) {
    console.error("Failed to get all reports", e);
    res.status(500).json({success: false, message: "Failed to get all reports"});
  } finally {
    client.release();
  }
}

export const getUserPosts = async (req, res) => {
  const client = await pool.connect();
  const {username} = req.params;

  try {
    const user = await client.query("SELECT * FROM users WHERE username = $1", [username]);
    if (!user) {
      return res.status(404).json({success: false, message: "User not found"});
    }
    const posts = await client.query(`
      SELECT 
      r.*, 
      u.username, u.profile_pic, u.name,
      c.id AS comment_id, c.text AS comment_text, c.user_id AS comment_user_id,
      cu.username AS comment_username, cu.profile_pic AS comment_profile_pic, cu.name AS comment_name
      FROM reports r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN report_comments c ON r.id = c.report_id
      LEFT JOIN users cu ON c.user_id = cu.id
      WHERE u.username = $1
      ORDER BY r.report_date DESC
    `, [username]);
    
    const postsMap = new Map();
    
    posts.rows.forEach(row => {
      if (!postsMap.has(row.id)) {
      postsMap.set(row.id, {
        id: row.id,
        user_id: row.user_id,
        latitude: row.latitude,
        longitude: row.longitude,
        country_code: row.country_code,
        description: row.description,
        report_date: row.report_date,
        user: {
        username: row.username,
        profile_pic: row.profile_pic,
        name: row.name
        },
        comments: []
      });
      }
    
      if (row.comment_id) {
      postsMap.get(row.id).comments.push({
        id: row.comment_id,
        text: row.comment_text,
        user_id: row.comment_user_id,
        user: {
        username: row.comment_username,
        profile_pic: row.comment_profile_pic,
        name: row.comment_name
        }
      });
      }
    });
    
    const postsWithDetails = Array.from(postsMap.values());
    
    if (postsWithDetails.length === 0) {
      return res.status(404).json({success: false, message: "No posts found for this user"});
    }
    res.json({success: true, posts: postsWithDetails});
  } catch (e) {
    console.error("Failed to get user posts", e);
    res.status(500).json({success: false, message: "Failed to get user posts"});
  } finally {
    client.release();
  }
}