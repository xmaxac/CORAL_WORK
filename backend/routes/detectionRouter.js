import express from "express";
import upload from "../middleware/upload.js";
import { uploadDetection } from "../controllers/detectionController.js";

const detectionRouter = express.Router();

detectionRouter.post("/upload", upload.single("file"), uploadDetection);

// detectionRouter.post("/process-video", upload.single("file"), videoDetection)

export default detectionRouter;