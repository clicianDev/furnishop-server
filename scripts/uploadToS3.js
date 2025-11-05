const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
require('dotenv').config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * Upload a file to S3
 */
async function uploadFile(filePath, s3Key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType
    });

    await s3Client.send(command);
    console.log(`✓ Uploaded: ${s3Key}`);
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
  } catch (error) {
    console.error(`✗ Failed to upload ${s3Key}:`, error.message);
    throw error;
  }
}

/**
 * Recursively upload directory to S3
 */
async function uploadDirectory(localDir, s3Prefix) {
  const items = fs.readdirSync(localDir);

  for (const item of items) {
    const localPath = path.join(localDir, item);
    const s3Key = path.join(s3Prefix, item).replace(/\\/g, '/');

    if (fs.statSync(localPath).isDirectory()) {
      console.log(`\nProcessing directory: ${item}`);
      await uploadDirectory(localPath, s3Key);
    } else {
      await uploadFile(localPath, s3Key);
    }
  }
}

/**
 * Main upload function
 */
async function uploadToS3() {
  try {
    console.log('Starting S3 upload...\n');
    console.log(`Bucket: ${BUCKET_NAME}`);
    console.log(`Region: ${process.env.AWS_REGION}\n`);

    // Upload models
    const modelsDir = path.join(__dirname, '../furnishop-client/public/models');
    if (fs.existsSync(modelsDir)) {
      console.log('Uploading models...');
      await uploadDirectory(modelsDir, 'models');
      console.log('✓ Models uploaded\n');
    }

    // Upload textures
    const texturesDir = path.join(__dirname, '../furnishop-client/public/textures');
    if (fs.existsSync(texturesDir)) {
      console.log('Uploading textures...');
      await uploadDirectory(texturesDir, 'textures');
      console.log('✓ Textures uploaded\n');
    }

    console.log('\n✓ All files uploaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Upload failed:', error);
    process.exit(1);
  }
}

// Run upload
uploadToS3();
