import express from "express";
import cors from "cors"
import reportRouter from "./routes/reportRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import dotenv from "dotenv"
import {v2 as cloudinary} from "cloudinary"

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//endpoints
app.use("/api/report", reportRouter)
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/notification", notificationRouter)


app.get("/", (req, res) => {
  res.send("Server is Online")
});

app.listen(PORT, () => {
  console.log(`Server Started on http://localhost:${PORT}`)
});