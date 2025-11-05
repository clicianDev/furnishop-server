const { S3Client, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function setBucketPolicy() {
  console.log('🔐 Setting S3 Bucket Policy...\n');
  
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: [
          `arn:aws:s3:::${BUCKET_NAME}/models/*`,
          `arn:aws:s3:::${BUCKET_NAME}/textures/*`
        ]
      }
    ]
  };

  try {
    const command = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(policy)
    });

    await s3Client.send(command);
    
    console.log('✅ Bucket policy set successfully!\n');
    console.log('Public access granted to:');
    console.log(`   - s3://${BUCKET_NAME}/models/*`);
    console.log(`   - s3://${BUCKET_NAME}/textures/*\n`);
    console.log('🔒 Private access maintained for:');
    console.log(`   - s3://${BUCKET_NAME}/uploads/*\n`);
    
    // Test access
    console.log('🧪 Testing public access...');
    const testUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/models/cabinet/cabinet-1.glb`;
    console.log(`   URL: ${testUrl}\n`);
    console.log('Try opening this URL in your browser - it should work now!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to set bucket policy:', error.message);
    
    if (error.name === 'AccessDenied') {
      console.log('\n💡 Your IAM user needs "s3:PutBucketPolicy" permission.');
      console.log('\nManually add this policy in AWS Console:');
      console.log('S3 → furnishop-bucket → Permissions → Bucket Policy → Edit\n');
      console.log(JSON.stringify(policy, null, 2));
      console.log('\n');
    }
    
    process.exit(1);
  }
}

setBucketPolicy();
