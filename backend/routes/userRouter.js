// Import required modules and functions
import express from "express"; // Express.js framework for handling HTTP requests
import auth from "../middleware/auth.js"; // Middleware for checking user authentication
import upload from "../middleware/upload.js"; // Middleware for handling file uploads
import { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUser } from "../controllers/userController.js"; // Import controller functions for user-related operations

// Create a new router for handling user-related routes
const userRouter = express.Router();

// Route to get a user's profile by their username (authentication required)
userRouter.get("/profile/:username", auth, getUserProfile); 
// 'auth' middleware ensures that only authenticated users can view the profile

// Route to get a list of suggested users (authentication required)
userRouter.get("/suggested", auth, getSuggestedUsers); 
// 'auth' middleware ensures that only authenticated users can see the suggested users

// Route to follow or unfollow a user by their ID (authentication required)
userRouter.post("/follow/:id", auth, followUnfollowUser); 
// 'auth' middleware ensures that only authenticated users can follow/unfollow another user

// Route to update a user's profile (authentication required, with file upload for images)
userRouter.post("/update", auth, upload.fields([ 
  { name: 'profileImg', maxCount: 1 }, // Allows uploading of 1 profile image
  { name: 'coverImg', maxCount: 1 }   // Allows uploading of 1 cover image
]), updateUser); 
// 'auth' middleware ensures that only authenticated users can update their profile
// 'upload.fields()' middleware handles file uploads for profile and cover images

// Export the router to be used in other parts of the application
export default userRouter;
