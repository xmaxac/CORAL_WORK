// Import required modules and functions
import express from "express"; // Express.js framework for handling HTTP requests
import auth from "../middleware/auth.js"; // Middleware for checking user authentication
import { getNotifications, deleteNotification } from "../controllers/notificationController.js"; // Import functions to handle notifications

// Create a new router for handling notification-related routes
const notificationRouter = express.Router();

// Route to get the notifications for an authenticated user
notificationRouter.get("/", auth, getNotifications); 
// The 'auth' middleware ensures that only authenticated users can access this route
// The 'getNotifications' function retrieves the user's notifications

// Route to delete a notification for an authenticated user
notificationRouter.delete("/", auth, deleteNotification); 
// The 'auth' middleware ensures that only authenticated users can access this route
// The 'deleteNotification' function deletes the specified notification for the user

// Export the router to be used in other parts of the application
export default notificationRouter;
