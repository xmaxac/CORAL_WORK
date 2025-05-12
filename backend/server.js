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
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import reportRouter from "./routes/reportRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import chatbotRouter from "./routes/chatbotRouter.js";
import detectionRouter from "./routes/detectionRouter.js";
import dotenv from "dotenv";
import axios from "axios";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

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
  max: 5,
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
app.listen(PORT, async () => {
  console.log(`Server Started on http://localhost:${PORT}`);
});
