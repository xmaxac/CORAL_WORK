// Import required modules and functions
import express from "express"; // Express.js framework for handling HTTP requests
import upload from "../middleware/upload.js"; // Middleware for handling file uploads
import { 
  createReport, 
  getLatestReports, 
  getLikeStatus, 
  getTopCountries, 
  deleteReport, 
  commentOnReport, 
  likeUnlikeReport, 
  getAllReports, 
  getUserReports,
  moderateReport,
  verifyReport
} from "../controllers/reportController.js"; // Import all functions from the reportController to handle various report-related operations
import auth from "../middleware/auth.js"; // Middleware to check user authentication

// Create a new router for handling report-related routes
const reportRouter = express.Router();

// Route to fetch all reports (no authentication required)
reportRouter.get('/all', getAllReports);

// Route to fetch reports for a specific user (authentication required)
reportRouter.get('/user/:username', auth, getUserReports); 
// 'auth' middleware ensures the user is authenticated before accessing their reports

// Route to create a new report (authentication required)
reportRouter.post('/create', auth, upload.fields([
  { name: 'images', maxCount: 10},
  { name: 'documents', maxCount: 5},
  { name: 'videos', maxCount: 1},
  { name: 'imageDetections', maxCount: 10}
]), createReport);
// 'auth' middleware checks if the user is authenticated before creating a report
// 'upload.fields()' middleware handles the file upload, allowing up to 10 images

reportRouter.post('/moderate', auth, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5},
  { name: 'videos', maxCount: 1},
  { name: 'imageDetections', maxCount: 10}
]), moderateReport);

// Route to delete a report by its ID (authentication required)
reportRouter.delete('/:id', auth, deleteReport); 
// 'auth' middleware ensures only authenticated users can delete a report

// Route to like or unlike a report by its ID (authentication required)
reportRouter.get('/like/:id', auth, likeUnlikeReport); 
// 'auth' middleware ensures that the user is authenticated before liking or unliking a report

// Route to get the like status of a report by its ID (authentication required)
reportRouter.get('/like-status/:id', auth, getLikeStatus); 
// 'auth' middleware ensures that only authenticated users can check the like status of a report

// Route to comment on a report by its ID (authentication required)
reportRouter.post('/comment/:id', auth, commentOnReport); 
// 'auth' middleware ensures only authenticated users can comment on a report

// Route to get the top countries related to reports (authentication required)
reportRouter.get('/country', auth, getTopCountries); 
// 'auth' middleware ensures the user is authenticated before fetching the top countries related to reports

// Route to get the latest reports (authentication required)
reportRouter.get('/latest-reports', auth, getLatestReports); 
// 'auth' middleware ensures that only authenticated users can fetch the latest reports

reportRouter.patch('/:id/verify', auth, verifyReport);

// Export the router to be used in other parts of the application
export default reportRouter;
