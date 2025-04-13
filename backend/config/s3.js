/**
 * AWS S3 File Management
 * 
 * This module provides functions to upload and delete files in an AWS S3 bucket.
 * 
 * - `uploadToS3`: Uploads an image file to a specified folder in the S3 bucket.
 * - `deleteFromS3`: Deletes an image file from the S3 bucket based on its URL.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize S3 client with AWS credentials
const s3Client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Uploads an image file to AWS S3.
 * 
 * - Generates a unique file name using UUID.
 * - Stores the file in the specified folder inside the S3 bucket.
 * - Returns the public URL of the uploaded file.
 * 
 * @param {Buffer} fileBuffer - The image file buffer.
 * @param {string} folder - The folder in which to store the file.
 * @param {string} fileName - The original file name.
 * @returns {string} URL of the uploaded image.
 */
export const uploadToS3 = async (fileBuffer, folder, fileName) => {
  const key = `${folder}/${uuidv4()}-${fileName}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/jpeg'
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${process.env.AWS_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${key}`;
  } catch (e) {
    console.error('Error uploading to S3:', e);
    throw new Error('Failed to upload image');
  }
};

/**
 * Deletes an image file from AWS S3.
 * 
 * - Extracts the file key from the provided image URL.
 * - Sends a delete request to remove the file from the S3 bucket.
 * 
 * @param {string} imageUrl - The URL of the image to be deleted.
 */
export const deleteFromS3 = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    const key = imageUrl.split('.amazonaws.com/')[1];
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (e) {
    console.error('Error deleting from S3:', e);
  }
};
