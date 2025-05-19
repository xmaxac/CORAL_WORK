import pool from "../database/db.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { uploadToS3, deleteFromS3 } from "../config/s3.js";
import OpenAI from "openai";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import os from "os";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const processImageUpload = async (
  fileBuffer,
  existingImageUrl = null,
  reportId,
  mimetype
) => {
  if (!fileBuffer) return existingImageUrl;

  try {
    const fileName = `${reportId}-reportImg.jpeg`;
    const imageUrl = uploadToS3(
      fileBuffer,
      `reports/${reportId}/images`,
      fileName,
      mimetype
    );
    return imageUrl;
  } catch (e) {
    console.error("Error uploading image:", e);
    throw new Error("Error uploading image:", e);
  }
};

const processDocumentUpload = async (file, reportId) => {
  if (!file) return null;

  try {
    const fileName = `${reportId}-${file.originalname}`;
    const documentUrl = uploadToS3(
      file.buffer,
      `reports/${reportId}/documents`,
      fileName,
      file.mimetype
    );
    return documentUrl;
  } catch (e) {
    console.error("Error uploading document:", e);
    throw new Error("Error uploading document:", e);
  }
};

const processVideoUpload = async (file, reportId) => {
  if (!file || !file.buffer) throw new Error("No video buffer found.");

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "video-upload-"));
  const inputPath = path.join(tmpDir, "input.mp4");
  const outputPath = path.join(tmpDir, "output.mp4");

  try {
    await fs.writeFile(inputPath, file.buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions("-fflags +genpts")
        .outputOptions([
          "-vcodec libx264",
          "-acodec copy",
          "-preset fast",
          "-crf 23",
          "-analyzeduration 100M",
          "-strict experimental",
          "-probesize 100M",
          "-max_muxing_queue_size 1024",
          "-r 30",
          "-async 1",
        ])
        .on("start", (cmd) => console.log("FFmpeg started:", cmd))
        .on("error", (e) => {
          console.error("FFmpeg error:", e.message);
          reject(new Error("Failed to process video"));
        })
        .on("end", resolve)
        .save(outputPath);
    });

    const finalBuffer = await fs.readFile(outputPath);
    const fileName = `${reportId}-${file.originalname.replace(
      /\.[^/.]+$/,
      ""
    )}.mp4`;
    const videoUrl = uploadToS3(
      finalBuffer,
      `reports/${reportId}/videos`,
      fileName,
      "video/mp4"
    );

    return videoUrl;
  } finally {
    try {
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (cleanupE) {
      console.warn("Temp file cleanup failed:", cleanupE);
    }
  }
};

export const createReport = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      title,
      latitude,
      longitude,
      countryCode,
      description,
      reportDate,
      reefName,
      reefType,
      averageDepth,
      waterTemp,
      group_id,
    } = req.body;
    const userId = req.user.id;

    const user = await client.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (!user.rows[0]) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!description || !latitude || !longitude || !countryCode || !title) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    const reportResult = await client.query(
      `INSERT INTO reports
      (user_id, title, latitude, longitude, country_code, description, report_date, reef_name, reef_type, average_depth, water_temp, group_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        userId,
        title,
        latitude,
        longitude,
        countryCode,
        description,
        reportDate,
        reefName,
        reefType,
        averageDepth,
        waterTemp,
        group_id,
      ]
    );
    const reportId = reportResult.rows[0].id;

    // Store photo IDs in an array to match with detections later
    const photoIds = [];

    // Process regular images first
    if (req.files && Array.isArray(req.files.images)) {
      for (const file of req.files.images) {
        const imageUrl = await processImageUpload(
          file.buffer,
          null,
          reportId,
          file.mimetype
        );

        // Insert the photo and store its ID
        const photoResult = await client.query(
          `INSERT INTO report_photos (photo_url, report_id) VALUES ($1, $2) RETURNING id`,
          [imageUrl, reportId]
        );
        
        photoIds.push(photoResult.rows[0].id);
      }
    }

    // Process detection images - using photoIds array to match with original photos
    if (req.files && Array.isArray(req.files.imageDetections)) {
      for (let i = 0; i < req.files.imageDetections.length; i++) {
        // Make sure we don't go out of bounds of the photoIds array
        if (i < photoIds.length) {
          const file = req.files.imageDetections[i];
          const imageUrl = await processImageUpload(
            file.buffer,
            null,
            reportId,
            file.mimetype
          );

          // Update the specific photo record using its ID
          await client.query(
            "UPDATE report_photos SET photo_detection = $1 WHERE id = $2",
            [imageUrl, photoIds[i]]
          );
        }
      }
    }

    if (req.files && Array.isArray(req.files.documents)) {
      for (const file of req.files.documents) {
        const documentUrl = await processDocumentUpload(file, reportId);

        await client.query(
          `INSERT INTO report_documents (file_name, file_type, s3_url, report_id) VALUES ($1, $2, $3, $4)`,
          [file.originalname, file.mimetype, documentUrl, reportId]
        );
      }
    }

    if (req.files && Array.isArray(req.files.videos)) {
      for (const file of req.files.videos) {
        const videoUrl = await processVideoUpload(file, reportId);

        await client.query(
          `INSERT INTO report_videos (file_name, file_type, s3_url, report_id) VALUES ($1, $2, $3, $4)`,
          [file.originalname, file.mimetype, videoUrl, reportId]
        );
      }
    }

    const countResult = await client.query(
      "SELECT COUNT(*) FROM reports WHERE group_id = $1",
      [group_id]
    );

    const count = parseInt(countResult.rows[0].count);

    // Update the group's report_count
    await client.query("UPDATE groups SET report_count = $1 WHERE id = $2", [
      count,
      group_id,
    ]);

    const completeReport = await client.query(
      `SELECT r.*, json_agg(DISTINCT jsonb_build_object('photo_url', rp.photo_url, 'photo_detection', rp.photo_detection)) as photos,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'file_name', rd.file_name,
            'file_type', rd.file_type,
            's3_url', rd.s3_url
          )
        ) FILTER (WHERE rd.id IS NOT NULL),
        '[]'
      ) AS documents,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'file_name', rv.file_name,
            'file_type', rv.file_type,
            's3_url', rv.s3_url
          )
        ) FILTER (WHERE rv.id IS NOT NULL),
        '[]'
      ) AS videos
    FROM reports r
    LEFT JOIN report_photos rp ON r.id = rp.report_id
    LEFT JOIN report_documents rd ON r.id = rd.report_id
    LEFT JOIN report_videos rv ON r.id = rv.report_id
    WHERE r.id = $1
    GROUP BY r.id`,
      [reportId]
    );

    await client.query("COMMIT");

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
        reef_name: reefName,
        reef_type: reefType,
        average_depth: averageDepth,
        water_temp: waterTemp,
        group_id: group_id,
        photos: completeReport.rows[0].photos.filter((photo) => photo !== null && photo.photo_url !== null),
        documents: completeReport.rows[0].documents.filter(
          (doc) => doc !== null && doc.s3_url !== null
        ),
        videos: completeReport.rows[0].videos.filter(
          (video) => video !== null && video.s3_url !== null
        ),
      },
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Failed to create a report", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to create report" });
  } finally {
    client.release();
  }
};

const sendReviewEmail = async (content) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const approveUrl = `http://localhost:4000`;
  const denyUrl = `http://localhost:4000`;

  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: "Pending Report Review",
    html: `
      <p><strong>Pending report needs review:</strong></p>
      <p>${content}</p>
      <p>
        <a href="${approveUrl}">✅ Approve</a> |
        <a href="${denyUrl}">❌ Deny</a>
      </p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const isPending = (results) => {
  for (const field in results) {
    const scores = results[field]?.category_scores;
    if (!scores) continue;

    const hasSuspiciousScore = Object.values(scores).some(
      (score) => score >= 0.1 && score < 0.7
    );
    if (hasSuspiciousScore) return true;
  }
  return false;
};

export const moderateReport = async (req, res) => {
  const client = await pool.connect();
  const { title, description, reefName, reefType } = req.body;

  const fieldsToModerate = {
    title,
    description,
    reefName,
    reefType,
  };

  await client.query("BEGIN");

  try {
    const contentSections = [];
    const flaggedSections = [];
    const moderationResults = {};

    for (const [field, content] of Object.entries(fieldsToModerate)) {
      const moderation = await openai.moderations.create({ input: content });
      const result = moderation.results[0];
      moderationResults[field] = result;

      contentSections.push({ field, content });

      if (result.flagged) {
        flaggedSections.push({
          field,
          content,
          categories: result.categories,
        });
      }
    }

    const marineCheckPrompt = `
      You are an assistant that classifies content as either marine-related or not marine-related. The content is about topics like coral reefs, marine life, ocean, marine diseases like Stony Coral Tissue Loss Disease (SCTLD), or general marine biology. 
      Please read the following description and classify it as either marine-related or not marine-related:
  
      Description: "${description}"
      If the content is related to marine topics, say "Marine-related". If it is not, say "Not marine-related".
    `;

    const marineCheck = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that classifies content as marine-related or not marine-related.",
        },
        { role: "user", content: marineCheckPrompt },
      ],
    });

    const marineJudgment = marineCheck.choices[0].message.content
      .trim()
      .toLowerCase();
    const isMarineRelated = marineJudgment === "marine-related";

    const moderationStatus =
      flaggedSections.length > 0 || isMarineRelated == "not marine-related"
        ? "flagged"
        : isPending(moderationResults)
        ? "pending"
        : "approved";

    await client.query(
      `INSERT INTO moderation_logs (user_id, content, is_flagged, is_marine_related, categories, status)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user.id,
        JSON.stringify(contentSections),
        flaggedSections.length > 0,
        isMarineRelated,
        JSON.stringify(moderationResults.description?.categories ?? {}),
        moderationStatus,
      ]
    );

    await client.query("COMMIT");

    if (moderationStatus === "pending") {
      const formattedContent = contentSections
        .map(({ field, content }) => `<strong>${field}:</strong> ${content}`)
        .join("<br>");

      await sendReviewEmail(formattedContent);
      return res.status(200).json({
        allowed: false,
        flagged: true,
        reason: "Pending moderation",
        flaggedSections,
        isMarineRelated,
      });
    }

    if (flaggedSections.length > 0 || !isMarineRelated) {
      return res.status(200).json({
        allowed: false,
        flagged: true,
        reason:
          "Flagged for inappropriate content or not marine-related content",
        flaggedSections,

        isMarineRelated,
      });
    }

    res.status(200).json({
      allowed: true,
      flagged: false,
      message: "Report is approved",
      isMarineRelated,
    });
  } catch (e) {
    console.error("Failed to moderate report", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to moderate report" });
  }
};

export const deleteReport = async (req, res) => {
  const client = await pool.connect();
  const reportId = req.params.id;
  const userId = req.user.id;
  try {
    const report = await client.query("SELECT * FROM reports WHERE id = $1", [
      reportId,
    ]);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    if (userId !== report.rows[0].user_id) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this report",
      });
    }

    if (report.rows[0].photo_url) {
      await deleteFromS3(report.rows[0].photo_url);

      await client.query("DELETE FROM report_photos WHERE report_id = $1", [
        reportId,
      ]);
    }

    await client.query("DELETE FROM reports WHERE id = $1", [reportId]);

    // await deleteCacheByPattern('latestReports:*');
    // await deleteCacheByPattern('allReports:*');
    // console.log('Cache cleared: deleted report');

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (e) {
    console.error("Failed to delete report", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete report" });
  } finally {
    client.release();
  }
};

export const commentOnReport = async (req, res) => {
  const { text } = req.body;
  const reportId = req.params.id;
  const userId = req.user.id;
  const client = await pool.connect();

  try {
    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Text Field is required" });
    }
    const report = await pool.query("SELECT * FROM reports WHERE id = $1", [
      reportId,
    ]);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
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

    res.status(201).json({
      success: true,
      comment: {
        id: comment.rows[0].id,
        text,
        user_id: userId,
        report_id: reportId,
      },
    });
  } catch (e) {
    console.error("Failed to comment on report", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to comment on report" });
  } finally {
    client.release();
  }
};

export const likeUnlikeReport = async (req, res) => {
  const client = await pool.connect();
  const userId = req.user.id;
  const reportId = req.params.id;

  try {
    const report = await pool.query("SELECT * FROM reports WHERE id = $1", [
      reportId,
    ]);
    if (report.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
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
      return res.json({
        success: true,
        message: "Report unliked successfully",
        liked: false,
      });
    } else {
      await pool.query(
        `INSERT INTO report_likes (user_id, report_id) VALUES ($1, $2)`,
        [userId, reportId]
      );

      await pool.query(
        `INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)`,
        [userId, `${req.user.username} liked your report`, "like"]
      );

      // await deleteCacheByPattern('allReports:*');
      // await deleteCacheByPattern('latestReports:*');
      // console.log('Cache cleared: liked report');
      return res.json({
        success: true,
        message: "Report liked successfully",
        liked: true,
      });
    }
  } catch (e) {
    console.error("Failed to like/unlike report", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to like/unlike report" });
  } finally {
    client.release();
  }
};

export const getAllReports = async (req, res) => {
  const client = await pool.connect();
  try {
    // First, get all reports with their basic information
    const reports = await client.query(
      `
        SELECT 
          r.id, r.user_id, r.latitude, r.longitude, r.country_code, r.title, r.description, r.report_date, r.created_at, r.reef_name, r.reef_type, r.average_depth, r.water_temp, r.group_id, r.status,
          r.verified_by, r.verified_at, r.verification_note,
          u.username, u.profile_image, u.name, u.role,
          COALESCE(likes_count.likes, 0) AS likes
        FROM reports r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN (
          SELECT report_id, COUNT(*) AS likes
          FROM report_likes
          GROUP BY report_id
        ) likes_count ON r.id = likes_count.report_id
        ORDER BY r.created_at DESC;
      `
    );

    const reportsMap = new Map();

    // Process base report data
    for (const row of reports.rows) {
      reportsMap.set(row.id, {
        id: row.id,
        group_id: row.group_id,
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
        user: {
          username: row.username,
          profile_image: row.profile_image,
          name: row.name,
          role: row.role,
        },
        status: row.status,
        verified_by: row.verified_by,
        verified_at: row.verified_at,
        verification_note: row.verification_note,
        likes: row.likes,
        photos: [],
        documents: [],
        videos: [],
        comments: [],
      });
    }

    // Get and process photos separately
    const photosResult = await client.query(
      `
      SELECT 
        report_id, photo_url, photo_detection 
      FROM report_photos
      WHERE report_id IN (${Array.from(reportsMap.keys()).map(id => `'${id}'`).join(',')})
      `
    );
    
    for (const photo of photosResult.rows) {
      const report = reportsMap.get(photo.report_id);
      if (report) {
        report.photos.push({
          photo_url: photo.photo_url,
          photo_detection: photo.photo_detection
        });
      }
    }

    // Get and process comments
    const commentsResult = await client.query(
      `
      SELECT 
        c.report_id, c.id AS comment_id, c.comment AS comment_text, c.user_id AS comment_user_id,
        u.username AS comment_username, u.profile_image AS comment_profile_image, u.name AS comment_name
      FROM report_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.report_id IN (${Array.from(reportsMap.keys()).map(id => `'${id}'`).join(',')})
      `
    );

    for (const comment of commentsResult.rows) {
      const report = reportsMap.get(comment.report_id);
      if (report) {
        report.comments.push({
          id: comment.comment_id,
          text: comment.comment_text,
          user_id: comment.comment_user_id,
          username: comment.comment_username,
          profile_image: comment.comment_profile_image,
          name: comment.comment_name,
        });
      }
    }

    // Get and process documents
    const documentsResult = await client.query(
      `
      SELECT 
        report_id, file_name, file_type, s3_url
      FROM report_documents
      WHERE report_id IN (${Array.from(reportsMap.keys()).map(id => `'${id}'`).join(',')})
      `
    );

    for (const doc of documentsResult.rows) {
      const report = reportsMap.get(doc.report_id);
      if (report) {
        report.documents.push({
          file_name: doc.file_name,
          file_type: doc.file_type,
          s3_url: doc.s3_url
        });
      }
    }

    // Get and process videos
    const videosResult = await client.query(
      `
      SELECT 
        report_id, file_name, file_type, s3_url
      FROM report_videos
      WHERE report_id IN (${Array.from(reportsMap.keys()).map(id => `'${id}'`).join(',')})
      `
    );

    for (const video of videosResult.rows) {
      const report = reportsMap.get(video.report_id);
      if (report) {
        report.videos.push({
          file_name: video.file_name,
          file_type: video.file_type,
          s3_url: video.s3_url
        });
      }
    }

    res
      .status(200)
      .json({ success: true, reports: Array.from(reportsMap.values()) });
  } catch (e) {
    console.error("Failed to get all reports", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to get all reports" });
  } finally {
    client.release();
  }
};

export const getUserReports = async (req, res) => {
  const client = await pool.connect();
  const { username } = req.params;

  try {
    // Get user
    const userResult = await client.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = userResult.rows[0];
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Get reports for user
    const reportsResult = await client.query(
      `
      SELECT 
        r.id, r.user_id, r.latitude, r.longitude, r.country_code, r.title, r.description, r.report_date, r.created_at, r.reef_name, r.reef_type, r.average_depth, r.water_temp, r.group_id, r.status,
        r.verified_by, r.verified_at, r.verification_note,
        u.username, u.profile_image, u.name, u.role,
        COALESCE(likes_count.likes, 0) AS likes
      FROM reports r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN (
        SELECT report_id, COUNT(*) AS likes
        FROM report_likes
        GROUP BY report_id
      ) likes_count ON r.id = likes_count.report_id
      WHERE u.username = $1
      ORDER BY r.created_at DESC;
      `,
      [username]
    );

    const reportsMap = new Map();

    for (const row of reportsResult.rows) {
      reportsMap.set(row.id, {
        id: row.id,
        group_id: row.group_id,
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
        user: {
          username: row.username,
          profile_image: row.profile_image,
          name: row.name,
          role: row.role,
        },
        status: row.status,
        verified_by: row.verified_by,
        verified_at: row.verified_at,
        verification_note: row.verification_note,
        likes: row.likes,
        photos: [],
        documents: [],
        videos: [],
        comments: [],
      });
    }

    const reportIds = Array.from(reportsMap.keys());
    if (reportIds.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No posts found for this user" });
    }

    // Photos
    const photosResult = await client.query(
      `
      SELECT 
        report_id, photo_url, photo_detection 
      FROM report_photos
      WHERE report_id = ANY($1)
      `,
      [reportIds]
    );
    for (const photo of photosResult.rows) {
      const report = reportsMap.get(photo.report_id);
      if (report) {
        report.photos.push({
          photo_url: photo.photo_url,
          photo_detection: photo.photo_detection
        });
      }
    }

    // Comments
    const commentsResult = await client.query(
      `
      SELECT 
        c.report_id, c.id AS comment_id, c.comment AS comment_text, c.user_id AS comment_user_id,
        u.username AS comment_username, u.profile_image AS comment_profile_image, u.name AS comment_name
      FROM report_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.report_id = ANY($1)
      `,
      [reportIds]
    );
    for (const comment of commentsResult.rows) {
      const report = reportsMap.get(comment.report_id);
      if (report) {
        report.comments.push({
          id: comment.comment_id,
          text: comment.comment_text,
          user_id: comment.comment_user_id,
          username: comment.comment_username,
          profile_image: comment.comment_profile_image,
          name: comment.comment_name,
        });
      }
    }

    // Documents
    const documentsResult = await client.query(
      `
      SELECT 
        report_id, file_name, file_type, s3_url
      FROM report_documents
      WHERE report_id = ANY($1)
      `,
      [reportIds]
    );
    for (const doc of documentsResult.rows) {
      const report = reportsMap.get(doc.report_id);
      if (report) {
        report.documents.push({
          file_name: doc.file_name,
          file_type: doc.file_type,
          s3_url: doc.s3_url
        });
      }
    }

    // Videos
    const videosResult = await client.query(
      `
      SELECT 
        report_id, file_name, file_type, s3_url
      FROM report_videos
      WHERE report_id = ANY($1)
      `,
      [reportIds]
    );
    for (const video of videosResult.rows) {
      const report = reportsMap.get(video.report_id);
      if (report) {
        report.videos.push({
          file_name: video.file_name,
          file_type: video.file_type,
          s3_url: video.s3_url
        });
      }
    }

    res.json({ success: true, reports: Array.from(reportsMap.values()) });
  } catch (e) {
    console.error("Failed to get user posts", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to get user posts" });
  } finally {
    client.release();
  }
};

export const getLikeStatus = async (req, res) => {
  const client = await pool.connect();
  const userId = req.user.id;
  const reportId = req.params.id;

  try {
    const like = await client.query(
      `SELECT * FROM report_likes WHERE user_id = $1 AND report_id = $2`,
      [userId, reportId]
    );

    const isLiked = like.rows.length > 0;
    res.json({ success: true, isLiked: isLiked });
  } catch (e) {
    console.error("Failed to get like status", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to get like status" });
  } finally {
    client.release();
  }
};

export const getTopCountries = async (req, res) => {
  const client = await pool.connect();
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
    console.error("Failed to get top countries", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to get top countries" });
  } finally {
    client.release();
  }
};

export const getLatestReports = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
        SELECT id, title, description, created_at
        FROM reports
        ORDER BY created_at DESC
        LIMIT 2
      `);
    res.json({ success: true, data: result.rows });
  } catch (e) {
    console.error("Failed to get latest reports", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to get latest reports" });
  } finally {
    client.release();
  }
};

export const verifyReport = async (req, res) => {
  const client = await pool.connect();
  const reportId = req.params.id;
  const { status, verification_note } = req.body;
  const userId = req.user.id;

  try {
    const user = await client.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    if (user.rows[0].role !== "researcher") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify reports",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!verification_note) {
      return res.status(400).json({
        success: false,
        message: "Note is required",
      });
    }

    await client.query(
      "UPDATE reports SET status = $1, verified_by = $2, verified_at = NOW(), verification_note = $3 WHERE id = $4",
      [status, userId, verification_note, reportId]
    )

    res.status(200).json({
      success: true,
      message: "Report verified successfully",
    })
  } catch (e) {
    console.error("Failed to verify report", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify report" });
  }
}
