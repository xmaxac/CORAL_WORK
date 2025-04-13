// Import required modules and functions
import express from "express"; // Express.js framework for handling HTTP requests
import upload from "../middleware/upload.js"; // Middleware for handling file uploads
import { uploadDetection } from "../controllers/detectionController.js"; // Import the 'uploadDetection' function from the detectionController

// Create a new router for handling detection-related routes
const detectionRouter = express.Router();

// Route to handle file upload and perform detection
detectionRouter.post("/upload", upload.single("file"), uploadDetection); 
// 'upload.single("file")' middleware handles the file upload and makes the file available to 'uploadDetection'

// Export the router to be used in other parts of the application
export default detectionRouter;
