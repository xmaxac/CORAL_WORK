import express from "express";
import cors from "cors"
import reportRouter from "./routes/reportRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import chatbotRouter from "./routes/chatbotRouter.js";
import detectionRouter from "./routes/detectionRouter.js";
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: ['http://localhost:5173', 'https://coralbase.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//endpoints
app.use("/api/report", reportRouter)
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/chatbot", chatbotRouter)
app.use("/api/detection", detectionRouter)


app.get("/", (req, res) => {
  res.send("Server is Online")
});

app.listen(PORT, async () => {
  console.log(`Server Started on http://localhost:${PORT}`)
});