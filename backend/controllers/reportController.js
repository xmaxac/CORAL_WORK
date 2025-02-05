import pool from "../database/db.js";
import { uploadToS3, deleteFromS3 } from "../config/s3.js";

const processImageUpload = async (fileBuffer, existingImageUrl = null, userId) => {
  if (!fileBuffer) return existingImageUrl;

  try {
    const fileName = `${userId}-reportImg-${Date.now()}.jpeg`;
    const imageUrl = await uploadToS3(fileBuffer, `reports/${userId}`, fileName);
    return imageUrl;
  } catch (e) {
    console.error('Error uploading image:', e);
    throw new Error('Error uploading image:', e);
  }
};

export const createReport = async (req, res) => {
  console.log(req);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { title, latitude, longitude, countryCode, description, reportDate } = req.body;
    const userId = req.user.id;

    const user = await client.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (!user.rows[0]) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!description || !latitude || !longitude || !countryCode || !title) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields" });
    }

    const reportResult = await client.query(
      `INSERT INTO reports
      (user_id, title, latitude, longitude, country_code, description, report_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
      [userId, title, latitude, longitude, countryCode, description, reportDate]
    );

    const reportId = reportResult.rows[0].id;

    //add photo is included
    let uploadedImageUrls = []
    if (req.files && Array.isArray(req.files.images)) {
      for (const file of req.files.images) {
        const imageUrl = await processImageUpload(file.buffer, null, reportId);
        uploadedImageUrls.push(imageUrl);

        await client.query(
          `INSERT INTO report_photos (photo_url, report_id) VALUES ($1, $2)`,
          [imageUrl, reportId]
        );
      }
    }

    const completeReport = await client.query(
      `SELECT r.*, array_agg(rp.photo_url) as photos
      FROM reports r
      LEFT JOIN report_photos rp ON r.id = rp.report_id
      WHERE r.id = $1
      GROUP BY r.id`,
      [reportId]
    );

    await client.query('COMMIT');

    // await deleteCacheByPattern('topCountries:*');
    // await deleteCacheByPattern('latestReports:*');
    // await deleteCacheByPattern('allReports:*');
    // console.log('Cache cleared - created report');

    res.json({
      success: true,
      report: {
        id: reportId,
        user_id: userId,
        title,
        latitude,
        longitude,
        country_code: countryCode,
        description,
        report_date: reportDate,
        photos: completeReport.rows[0].photos.filter(url => url !== null) // Filter out null values
      }
    });

  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Failed to create a report", e)
    res.status(500).json({ success: false, message: 'Failed to create report' })
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
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    if (userId !== report.rows[0].user_id) {
      return res.status(401).json({ success: false, message: "You are not authorized to delete this report" });
    }

    if (report.rows[0].photo_url) {
      await deleteFromS3(report.rows[0].photo_url);

      await client.query(
        "DELETE FROM report_photos WHERE report_id = $1",
        [reportId]
      );
    }

    await client.query("DELETE FROM reports WHERE id = $1", [reportId]);

    // await deleteCacheByPattern('latestReports:*');
    // await deleteCacheByPattern('allReports:*');
    // console.log('Cache cleared: deleted report');

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (e) {
    console.error("Failed to delete report", e);
    res.status(500).json({ success: false, message: "Failed to delete report" });
  } finally {
    client.release();
  }
}

export const commentOnReport = async (req, res) => {
  const { text } = req.body;
  const reportId = req.params.id;
  const userId = req.user.id;
  const client = await pool.connect();

  try {
    if (!text) {
      return res.status(400).json({ success: false, message: "Text Field is required" });
    }
    const report = await pool.query("SELECT * FROM reports WHERE id = $1", [reportId]);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const comment = await client.query(
      `INSERT INTO report_comments (comment, user_id, report_id)
      VALUES ($1, $2, $3)
      RETURNING id`,
      [text, userId, reportId]
    );

    // await deleteCacheByPattern('allReports*');
    // await deleteCacheByPattern('latestReports:*');
    // console.log('Cache cleared: commented on report');

    res.status(201).json({ success: true, comment: { id: comment.rows[0].id, text, user_id: userId, report_id: reportId } });
  } catch (e) {
    console.error("Failed to comment on report", e);
    res.status(500).json({ success: false, message: "Failed to comment on report" });
  } finally {
    client.release();
  }
}

export const likeUnlikeReport = async (req, res) => {
  const client = await pool.connect();
  const userId = req.user.id;
  const reportId = req.params.id;

  try {
    const report = await pool.query("SELECT * FROM reports WHERE id = $1", [reportId]);
    if (report.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const like = await pool.query(
      `SELECT * FROM report_likes WHERE user_id = $1 AND report_id = $2`,
      [userId, reportId]
    );


    if (like.rows.length) {
      await pool.query(
        `DELETE FROM report_likes WHERE user_id = $1 AND report_id = $2`,
        [userId, reportId]
      );
      // await deleteCacheByPattern('allReports:*');
      // await deleteCacheByPattern('latestReports:*');
      // console.log('Cache cleared:unliked report');
      return res.json({ success: true, message: "Report unliked successfully", liked: false });
    } else {
      await pool.query(
        `INSERT INTO report_likes (user_id, report_id) VALUES ($1, $2)`,
        [userId, reportId]
      );

      await pool.query(
        `INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)`,
        [userId, `${req.user.username} liked your report`, 'like']
      );

      // await deleteCacheByPattern('allReports:*');
      // await deleteCacheByPattern('latestReports:*');
      // console.log('Cache cleared: liked report');
      return res.json({ success: true, message: "Report liked successfully", liked: true });
    }
  } catch (e) {
    console.error("Failed to like/unlike report", e);
    res.status(500).json({ success: false, message: "Failed to like/unlike report" });
  } finally {
    client.release();
  }
}

export const getAllReports = async (req, res) => {
  console.log(req);
  const client = await pool.connect();
  try {
    const reports = await client.query(`
        SELECT 
          r.id, r.user_id, r.latitude, r.longitude, r.country_code, r.title, r.description, r.report_date, r.created_at,
          u.username, u.profile_image, u.name,
          c.id AS comment_id, c.comment AS comment_text, c.user_id AS comment_user_id,
          cu.username AS comment_username, cu.profile_image AS comment_profile_image, cu.name AS comment_name,
          COALESCE(likes_count.likes, 0) AS likes,
          array_agg(rp.photo_url) AS report_photo_urls
        FROM reports r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN report_comments c ON r.id = c.report_id
        LEFT JOIN users cu ON c.user_id = cu.id
        LEFT JOIN (
          SELECT report_id, COUNT(*) AS likes
          FROM report_likes
          GROUP BY report_id
        ) likes_count ON r.id = likes_count.report_id
        LEFT JOIN report_photos rp ON r.id = rp.report_id
        GROUP BY r.id, r.user_id, r.latitude, r.longitude, r.country_code, r.title, r.description, r.report_date,
                u.username, u.profile_image, u.name,
                c.id, c.comment, c.user_id,
                cu.username, cu.profile_image, cu.name, likes_count.likes
        ORDER BY r.created_at DESC
      `, []);

    const reportsMap = new Map();

    reports.rows.forEach(row => {
      if (!reportsMap.has(row.id)) {
        reportsMap.set(row.id, {
          id: row.id,
          user_id: row.user_id,
          latitude: row.latitude,
          longitude: row.longitude,
          country_code: row.country_code,
          title: row.title,
          description: row.description,
          report_date: row.report_date,
          created_at: row.created_at,
          photos: row.report_photo_urls || [],
          user: {
            username: row.username,
            profile_image: row.profile_image,
            name: row.name
          },
          likes: row.likes,
          comments: []
        });
      }

      if (row.comment_id) {
        reportsMap.get(row.id).comments.push({
          id: row.comment_id,
          text: row.comment_text,
          user_id: row.comment_user_id,
          username: row.comment_username,
          profile_image: row.comment_profile_image,
          name: row.comment_name
        });
      }
    });

    res.status(200).json({ success: true, reports: Array.from(reportsMap.values()) });
  } catch (e) {
    console.error("Failed to get all reports", e);
    res.status(500).json({ success: false, message: "Failed to get all reports" });
  } finally {
    client.release();
  }
}

export const getUserReports = async (req, res) => {
  const client = await pool.connect();
  const { username } = req.params;

  try {
    const user = await client.query("SELECT * FROM users WHERE username = $1", [username]);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
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
      return res.status(404).json({ success: false, message: "No posts found for this user" });
    }
    res.json({ success: true, posts: postsWithDetails });
  } catch (e) {
    console.error("Failed to get user posts", e);
    res.status(500).json({ success: false, message: "Failed to get user posts" });
  } finally {
    client.release();
  }
}

export const getLikeStatus = async (req, res) => {
  const client = await pool.connect()
  const userId = req.user.id
  const reportId = req.params.id;

  try {
    const like = await client.query(
      `SELECT * FROM report_likes WHERE user_id = $1 AND report_id = $2`,
      [userId, reportId]
    );

    const isLiked = like.rows.length > 0;
    res.json({ success: true, isLiked: isLiked })
  } catch (e) {
    console.error("Failed to get like status", e)
    res.status(500).json({ success: false, message: 'Failed to get like status' })
  } finally {
    client.release()
  }
}

export const getTopCountries = async (req, res) => {
  const client = await pool.connect()
  try {
    const result = await client.query(`
        SELECT country_code AS country, COUNT(*) as cases
        FROM reports
        GROUP BY country_code
        ORDER BY cases DESC
        LIMIT 4
      `);
    res.json({ success: true, data: result.rows });
  } catch (e) {
    console.error("Failed to get top countries", e)
    res.status(500).json({ success: false, message: 'Failed to get top countries' });
  } finally {
    client.release();
  }
}

export const getLatestReports = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
        SELECT id, title, description, created_at
        FROM reports
        ORDER BY created_at DESC
        LIMIT 2
      `);
    res.json({ success: true, data: result.rows })
  } catch (e) {
    console.error('Failed to get latest reports', e);
    res.status(500).json({ success: false, message: 'Failed to get latest reports' });
  } finally {
    client.release();
  }
}