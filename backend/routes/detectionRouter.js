import express from "express";
import upload from "../middleware/upload.js";
import { uploadDetection, pythonCall } from "../controllers/detectionController.js";

const detectionRouter = express.Router();

detectionRouter.post("/upload", upload.single("file"), uploadDetection);

detectionRouter.post("/process-video", upload.single("video"), pythonCall)

export default detectionRouter;