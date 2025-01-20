import {S3Client, PutObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import {v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const uploadToS3 = async (fileBuffer, folder, fileName) => {
  const key = `${folder}/${uuidv4()}-${fileName}`;

  const uploadParams ={
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/jpeg'
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (e) {
    console.error('Error uploading to S3:', e);
    throw new Error('Failed to upload image');
  }
}

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
}