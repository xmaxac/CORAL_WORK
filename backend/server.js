import express from "express";
import cors from "cors"
import reportRouter from "./routes/reportRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import chatbotRouter from "./routes/chatbotRouter.js";
import detectionRouter from "./routes/detectionRouter.js";
import dotenv from "dotenv"
import axios from "axios";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//endpoints
app.use("/api/report", reportRouter)
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/chatbot", chatbotRouter)
app.use("/api/detection", detectionRouter)

app.get("/api/news", async (req, res) => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=Marine conservation efforts coral&apiKey=${process.env.NEWS_API_KEY}&language=en&sortBy=relevancy`);
    res.json(response.data)
  } catch (e) {
    console.error("Error fetching news:", e.response?.data);
    res.status(500).json({ message: "Failed to fetch news" })
  }
});


app.get("/", (req, res) => {
  res.send("Server is Online")
});

app.listen(PORT, async () => {
  console.log(`Server Started on http://localhost:${PORT}`)
});