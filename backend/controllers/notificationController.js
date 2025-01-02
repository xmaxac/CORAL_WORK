import pool from "../database/db";

export const getNotifications = async (req, res) => {
  const client = await pool.connect();
  const userId = req.user.id;

  try {
    const notifications = await client.query(
      `SELECT n.*, u.username, u.profile_image 
       FROM notifications n
       JOIN users u ON n.actor_id = u.id
       WHERE n.user_id = $1 
       ORDER BY n.created_at DESC`,
      [userId]
    );

    // Update notifications to mark them as read
    await client.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [userId]
    );

    res.status(200).json(notifications.rows);
  } catch (e) {
    console.error("Error in getNotifications: ", e.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
}

export const deleteNotification = async (req, res) => {
  const client = await pool.connect();
  const userId = req.user.id;

  try {
    await client.query(
      'DELETE FROM notifications WHERE user_id = $1',
      [userId]
    )
    res.status(200).json({success:true, message: "Notifications Deleted" });
  } catch (e) {
    console.error("Error in deleteNotification: ", e.message);
    res.status(500).json({success:false, message: "Server Error"});
  } finally {
    client.release();
  }
}