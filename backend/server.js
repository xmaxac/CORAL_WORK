/**
 * Express Server Configuration
 * 
 * This server handles:
 * - User authentication
 * - Report management
 * - Chatbot interactions
 * - Detection services
 * - Notifications
 * - Fetching marine conservation news
 * 
 * Uses dotenv for environment variables and axios for external API requests.
 */

import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import reportRouter from "./routes/reportRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import chatbotRouter from "./routes/chatbotRouter.js";
import detectionRouter from "./routes/detectionRouter.js";
import chatRouter from "./routes/chatRouter.js";
import dotenv from "dotenv";
import axios from "axios";
import pool from "./database/db.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// User tracking for real-time communication
const onlineUsers = new Map();

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Needed if using inline scripts
        "https://maps.googleapis.com",
        "https://cdn.jsdelivr.net", // If you're using frontend libs via CDN
      ],

      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Inline styles for maps, fonts, etc.
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
      ],

      fontSrc: ["'self'", "https://fonts.gstatic.com"],

      imgSrc: [
        "'self'",
        "data:", // base64 images
        "blob:",
        "https://maps.googleapis.com",
        "https://*.gstatic.com",
        "https://yolo.coralbase.net", // detection images
      ],

      connectSrc: [
        "'self'",
        "https://api.openai.com",
        "https://newsapi.org",
        "https://yolo.coralbase.net",
        "https://nominatim.openstreetmap.org",
        // "http://localhost:4000", // Replace with your actual backend URL
        "https://*.amazonaws.com", // For AWS S3, etc.
      ],

      frameAncestors: ["'none'"], // Prevents clickjacking

      objectSrc: ["'none'"],

      baseUri: ["'self'"],

      // upgradeInsecureRequests: [], // Optional: force HTTPS
    },
  })
);

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later."}
})

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: {message: "Too many login attempts. Try again later." }
})

// Middleware configuration
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true // Allow credentials (cookies, authorization headers)
}));

app.use(globalLimiter)

app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// API route endpoints
app.use("/api/report", reportRouter); // Handles report-related operations
app.use("/api/auth", authLimiter, authRouter); // Manages user authentication
app.use("/api/user", userRouter); // Handles user-related operations
app.use("/api/chatbot", chatbotRouter); // Provides chatbot services
app.use("/api/detection", detectionRouter); // Manages detection-related processes
app.use("/api/chat", chatRouter);

/**
 * Fetch latest marine conservation news
 * Calls an external API (NewsAPI) to retrieve relevant news articles.
 */
app.get("/api/news", async (req, res) => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=Marine conservation efforts coral&apiKey=${process.env.NEWS_API_KEY}&language=en&sortBy=relevancy`);
    res.json(response.data);
  } catch (e) {
    console.error("Error fetching news:", e.response?.data);
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

/**
 * Root Route
 * Provides a basic response to indicate that the server is online.
 */
app.get("/", (req, res) => {
  res.send("Server is Online");
});

/**
 * Start the Express server
 * The server listens on the specified port and logs its status.
 */
const io = new SocketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

server.listen(PORT, () => {
  console.log(`Server Started on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register", (userId) => {
    if (!userId) return;

      onlineUsers.set(userId);
      socket.userId = userId;

    if (userId) {
      // Clean up any previous socket connections for this user
      for (const [existingUserId, socketId] of onlineUsers.entries()) {
        if (existingUserId === userId && socketId !== socket.id) {
          onlineUsers.delete(existingUserId);
        }
      }

      io.emit('userConnected', userId);
    
      socket.emit('onlineUsers', Array.from(onlineUsers));
      
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
      console.log("Current online users:", Array.from(onlineUsers.entries()));
    }
  });

  socket.on("sendMessage", async ({ sender_id, recipient_id, content }) => {
    try {
      console.log("Message received:", { sender_id, recipient_id, content });
      
      // Save message to database
      const result = await pool.query(
        'INSERT INTO messages (sender_id, recipient_id, content, read) VALUES ($1, $2, $3, FALSE) RETURNING *',
        [sender_id, recipient_id, content] 
      );

      const message = result.rows[0];
      console.log("Message saved:", message);

      // Send message to recipient if online
      const recipientSocket = onlineUsers.get(recipient_id);
      if (recipientSocket) {
        console.log(`Sending message to recipient socket: ${recipientSocket}`);
        io.to(recipientSocket).emit("receiveMessage", { message });
      }
      
      // Also send back to sender to confirm it was sent
      const senderSocket = onlineUsers.get(sender_id);
      if (senderSocket && senderSocket !== socket.id) {
        console.log(`Sending confirmation to sender socket: ${senderSocket}`);
        io.to(senderSocket).emit("receiveMessage", { message });
      }
    } catch (e) {
      console.error("Socket sendMessage failed:", e);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  socket.on("typing", ({ fromUserId, toUserId }) => {
    try {
      console.log(`User ${fromUserId} is typing to ${toUserId}`);
      const recipientSocket = onlineUsers.get(toUserId);
      if (recipientSocket) {
        io.to(recipientSocket).emit("typing", { fromUserId });
      }
    } catch (e) {
      console.error("Socket typing notification failed:", e);
    }
  });

  socket.on("markRead", async ({ reader_id, sender_id }) => {
    try {
      console.log(`Reader ${reader_id} is marking messages from ${sender_id} as read`);
      
      // Update database to mark messages as read
      await pool.query(
        'UPDATE messages SET read = TRUE WHERE sender_id = $1 AND recipient_id = $2 AND read = FALSE',
        [sender_id, reader_id]
      );
      
      // Notify sender that messages were read
      const senderSocket = onlineUsers.get(sender_id);
      if (senderSocket) {
        io.to(senderSocket).emit("readReceipt", { reader_id, sender_id });
      }
    } catch (e) {
      console.error("Socket markRead failed:", e);
    }
  });

  socket.on("disconnect", () => {
    // Find user ID associated with this socket
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        console.log(`User ${userId} disconnected`);
        onlineUsers.delete(userId);
        io.emit("userDisconnected", userId);
        break;
      }
    }
  });
});