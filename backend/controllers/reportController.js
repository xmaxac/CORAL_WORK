import pool from "../database/db.js";

export const createReport = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let userId;
    if (req.body.email) {

      const emailCount = await client.query(
        `SELECT COUNT(*) from users WHERE email = $1`,
        [req.body.email]
      );

      if (parseInt(emailCount.rows[0].count) > 0) {
        console.log(`${req.body.email} already exists, please try again with a different email.`)
        return res.status(500).json({success: false, error: 'Email already exists, please try again with a different email.'});
      } else {
        const userResult = await client.query(
          `INSERT INTO users (email, name, is_guest, guest_identifier) 
          VALUES ($1, $2, false, null)
          ON CONFLICT (email) DO UPDATE SET name = $2
          RETURNING id`,
          [req.body.email, req.body.name]
        );
        userId = userResult.rows[0].id;
      }
    } else {
      const userResult = await client.query(
        `INSERT INTO users (guest_identifier, is_guest)
        VALUES (generate_guest_identifier(), true)
        RETURNING id`
      );
      userId = userResult.rows[0].id;
    }
    
    const reportResult = await client.query(
      `INSERT INTO reports
      (user_id, latitude, longitude, country_code, description, report_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [userId, req.body.latitude, req.body.longitude,
        req.body.countryCode, req.body.description, req.body.reportDate
      ]
    );

    //add photo is included

    await client.query('COMMIT');
    res.json({success: true, reportId: reportResult.rows[0].id });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Failed to create a report", e)
    res.status(500).json({success: false , error: 'Failed to create report'})
  } finally {
    client.release()
  }
}