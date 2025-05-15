import pool from "../database/db.js";

export const sendMessage = async (req, res) => {
    const client = await pool.connect();
    const { recipient_id, content } = req.body;
    const sender_id = req.user.id;

    try {
        const result = await client.query(
            'INSERT INTO messages (sender_id, recipient_id, content, read) VALUES ($1, $2, $3, FALSE) RETURNING *',
            [sender_id, recipient_id, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (e) {
        console.error("Error sending message:", e);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release()
    }
};

export const getMessages = async (req, res) => {
    const client = await pool.connect();
    const {userId} = req.params;
    const {offset = 0, limit = 50} = req.query; // Increased limit for better user experience
    const user_id = req.user.id;

    try {
        // Mark messages as read when fetched
        await client.query(
            'UPDATE messages SET read = TRUE WHERE sender_id = $1 AND recipient_id = $2 AND read = FALSE',
            [userId, user_id]
        );
        
        const result = await client.query(
            `
            SELECT * FROM messages 
            WHERE (sender_id = $1 AND recipient_id = $2) 
                OR (sender_id = $2 AND recipient_id = $1)
            ORDER BY created_at DESC
            LIMIT $3 OFFSET $4
            `,
            [user_id, userId, limit, offset]
        );
        res.json(result.rows);
    } catch (e) {
        console.error("Error fetching messages:", e);
        res.status(500).json({ message: "internal server error" });
    } finally {
        client.release()
    }
}

export const getConversations = async (req, res) => {
    const client = await pool.connect();
    const user_id = req.user.id;

    try {
        // Get the most recent message for each conversation
        const conversationsQuery = `
            WITH latest_messages AS (
                SELECT 
                    DISTINCT ON (
                        CASE 
                            WHEN sender_id = $1 THEN recipient_id
                            ELSE sender_id
                        END
                    ) 
                    CASE 
                        WHEN sender_id = $1 THEN recipient_id
                        ELSE sender_id
                    END AS user_id,
                    content,
                    created_at,
                    read,
                    sender_id
                FROM messages
                WHERE sender_id = $1 OR recipient_id = $1
                ORDER BY user_id, created_at DESC
            )
            SELECT 
                lm.user_id,
                lm.content as last_message,
                lm.created_at as last_message_time,
                lm.read as is_read,
                lm.sender_id as last_sender_id,
                (
                    SELECT COUNT(*) 
                    FROM messages 
                    WHERE sender_id = lm.user_id AND recipient_id = $1 AND read = FALSE
                ) as unread_count
            FROM latest_messages lm
            ORDER BY lm.created_at DESC
        `;
        
        const result = await client.query(conversationsQuery, [user_id]);

        const userIds = result.rows.map(r => r.user_id);

        const userResult = await client.query(
            `SELECT id, username, email, profile_image FROM users WHERE id = ANY($1::uuid[])`,
            [userIds]
        );
        
        // Combine user info with conversation data
        const conversations = userResult.rows.map(user => {
            const conversationData = result.rows.find(r => r.user_id === user.id);
            return {
                ...user,
                last_message: conversationData?.last_message || null,
                last_message_time: conversationData?.last_message_time || null,
                unread_count: parseInt(conversationData?.unread_count || 0),
                is_read: conversationData?.is_read || true,
                last_sender_id: conversationData?.last_sender_id || null
            };
        });

        res.json(conversations);
    } catch (e) {
        console.error("Failed to get conversations:", e);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
    }
};

export const getAllUsers = async (req, res) => {
  const client = await pool.connect();
  const currentUserId = req.user.id;

  try {
    // Return all users except current user
    const result = await client.query(
      "SELECT id, username, email, profile_image FROM users WHERE id != $1",
      [currentUserId]
    );
    res.json(result.rows);
  } catch (e) {
    console.error("Error fetching users:", e);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release()
  }
}

export const readMessages = async (req, res) => {
    const client = await pool.connect();
    const { userId } = req.params;
    const user_id = req.user.id;

    try {
        const result = await client.query(
            'UPDATE messages SET read = TRUE WHERE sender_id = $1 AND recipient_id = $2 AND read = FALSE RETURNING id',
            [userId, user_id]
        );
        
        const updatedCount = result.rowCount;
        res.status(200).json({ 
            message: `${updatedCount} messages marked as read`,
            updated_ids: result.rows.map(row => row.id)
        });
    } catch (e) {
        console.error("Error marking messages as read:", e);
        res.status(500).json({ message: "Internal server error "});
    } finally {
        client.release()
    }
};