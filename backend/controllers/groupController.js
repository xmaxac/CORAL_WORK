import pool from "../database/db.js";

export const createGroups = async (req, res) => {
  const client = await pool.connect();
  const { name, description } = req.body;
  const userId = req.user.id;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Group name is required" });
  } else if (!description || description.trim() === "") {
    return res.status(400).json({ error: "Group description is required" });
  }

  try {
    const result = await client.query(
      "INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING *",
      [name.trim(), description, userId]
    );
    res.status(201).json({
      group: result.rows[0],
    });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ error: "Group name already exists" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to create group" });
  } finally {
    client.release();
  }
};

export const getAllGroups = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM groups ORDER BY created_at DESC"
    );

    res.status(200).json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch groups " });
  } finally {
    client.release();
  }
};

export const getGroupById = async (req, res) => {
  const client = await pool.connect();
  const { groupId } = req.params;
  try {
    const result = await client.query("SELECT * FROM groups WHERE id = $1", [
      groupId,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Group not found" });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch group" });
  } finally {
    client.release();
  }
};

export const getReports = async (req, res) => {
  const client = await pool.connect();
  const { groupId } = req.params;

  try {
    const result = await client.query(
      `
        SELECT 
          r.id, r.user_id, r.latitude, r.longitude, r.country_code, r.title, r.description, r.report_date, r.created_at, r.reef_name, r.reef_type, r.average_depth, r.water_temp,
          u.username, u.profile_image, u.name,
          c.id AS comment_id, c.comment AS comment_text, c.user_id AS comment_user_id,
          cu.username AS comment_username, cu.profile_image AS comment_profile_image, cu.name AS comment_name,
          COALESCE(likes_count.likes, 0) AS likes,

          (
            SELECT json_agg(jsonb_build_object(
              'photo_url', rp.photo_url,
              'photo_detection', rp.photo_detection
            ))
            FROM report_photos rp
            WHERE rp.report_id = r.id
          ) AS photos,

          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'file_name', rd.file_name,
                'file_type', rd.file_type,
                's3_url', rd.s3_url
              )
            ) FILTER (WHERE rd.id IS NOT NULL), '[]'
          ) AS documents,

          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'file_name', rv.file_name,
                'file_type', rv.file_type,
                's3_url', rv.s3_url
              )
            ) FILTER (WHERE rv.id IS NOT NULL), '[]'
          ) AS videos

        FROM reports r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN report_comments c ON r.id = c.report_id
        LEFT JOIN users cu ON c.user_id = cu.id
        LEFT JOIN (
          SELECT report_id, COUNT(*) AS likes
          FROM report_likes
          GROUP BY report_id
        ) likes_count ON r.id = likes_count.report_id

        -- DO NOT JOIN report_photos here
        LEFT JOIN report_documents rd ON r.id = rd.report_id
        LEFT JOIN report_videos rv ON r.id = rv.report_id

        WHERE r.group_id = $1

        GROUP BY r.id, r.user_id, r.latitude, r.longitude, r.country_code, r.title, r.description, r.report_date, r.reef_name, r.reef_type, r.average_depth, r.water_temp, r.created_at,
                 u.username, u.profile_image, u.name,
                 c.id, c.comment, c.user_id,
                 cu.username, cu.profile_image, cu.name, likes_count.likes

        ORDER BY r.created_at DESC
      `,
      [groupId]
    );

    const reportsMap = new Map();

    result.rows.forEach((row) => {
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
          reef_name: row.reef_name,
          reef_type: row.reef_type,
          average_depth: row.average_depth,
          water_temp: row.water_temp,
          photos: row.photos || [],
          documents: row.documents || [],
          videos: row.videos || [],
          groupId: groupId,
          user: {
            username: row.username,
            profile_image: row.profile_image,
            name: row.name,
          },
          likes: row.likes,
          comments: [],
        });
      }

      if (row.comment_id) {
        reportsMap.get(row.id).comments.push({
          id: row.comment_id,
          text: row.comment_text,
          user_id: row.comment_user_id,
          username: row.comment_username,
          profile_image: row.comment_profile_image,
          name: row.comment_name,
        });
      }
    });

    res.status(200).json({
      success: true,
      reports: Array.from(reportsMap.values()),
    });
  } catch (err) {
    console.error("Failed to fetch group reports", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  } finally {
    client.release();
  }
};


export const deleteGroup = async (req, res) => {
  const client = await pool.connect();
  const groupId = req.params.groupId;
  const userId = req.user.id;

  try {
    const group = await client.query("SELECT * FROM groups WHERE id = $1", [
      groupId,
    ]);
    if (group.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    if (userId !== group.rows[0].created_by) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this group",
      });
    }

    await client.query("DELETE FROM groups WHERE id = $1", [groupId]);

    res.json({ success: true, message: "Group deleted successfully" });
  } catch (e) {
    console.error("Failed to delete group", e);
    res.status(500).json({ success: false, message: "Failed to delete group" });
  } finally {
    client.release();
  }
};
