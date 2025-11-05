const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

// Initialize S3 client
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function testS3Connection() {
  console.log('🧪 Testing AWS S3 Connection...\n');
  
  // Test 1: Check credentials
  console.log('1️⃣  Checking configuration...');
  console.log(`   Region: ${REGION}`);
  console.log(`   Bucket: ${BUCKET_NAME}`);
  console.log(`   Access Key: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 8)}...`);
  
  if (!REGION || !BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('   ❌ Missing AWS credentials in .env file');
    console.log('\n   Please add the following to your .env file:');
    console.log('   AWS_REGION=your-region');
    console.log('   AWS_ACCESS_KEY_ID=your-access-key');
    console.log('   AWS_SECRET_ACCESS_KEY=your-secret-key');
    console.log('   AWS_S3_BUCKET_NAME=furnishop-bucket\n');
    process.exit(1);
  }
  console.log('   ✅ Configuration looks good\n');

  // Test 2: List bucket contents
  try {
    console.log('2️⃣  Testing bucket access (ListBucket)...');
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 5
    });
    
    const response = await s3Client.send(listCommand);
    console.log(`   ✅ Successfully connected to bucket`);
    console.log(`   Found ${response.KeyCount} objects (showing first 5)`);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('\n   Sample files:');
      response.Contents.forEach(obj => {
        console.log(`   - ${obj.Key} (${(obj.Size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('   ℹ️  Bucket is empty');
    }
    console.log('');
  } catch (error) {
    console.log('   ⚠️  Cannot list bucket contents');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('s3:ListBucket') || error.name === 'AccessDenied') {
      console.log('\n   ℹ️  This is optional - the app can work without ListBucket permission.');
      console.log('   However, you should still add the IAM policy shown below.\n');
    } else if (error.name === 'NoSuchBucket') {
      console.log('\n   💡 Bucket does not exist. Create it in AWS Console first.\n');
      process.exit(1);
    } else if (error.name === 'InvalidAccessKeyId') {
      console.log('\n   💡 Check your AWS credentials.\n');
      process.exit(1);
    }
  }

  // Test 3: Test upload (create a small test file)
  try {
    console.log('3️⃣  Testing file upload...');
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = `S3 Integration Test\nTimestamp: ${new Date().toISOString()}`;
    
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `uploads/tests/${testFileName}`,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain'
    });
    
    await s3Client.send(putCommand);
    console.log(`   ✅ Successfully uploaded test file`);
    console.log(`   File: uploads/tests/${testFileName}`);
    console.log(`   URL: https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/uploads/tests/${testFileName}\n`);
  } catch (error) {
    console.log('   ❌ Failed to upload test file');
    console.log(`   Error: ${error.message}\n`);
    
    if (error.name === 'AccessDenied') {
      console.log('   💡 IAM user needs "s3:PutObject" permission.\n');
    }
    
    process.exit(1);
  }

  // Test 4: Check folder structure
  console.log('4️⃣  Checking folder structure...');
  const requiredFolders = ['models/', 'textures/', 'uploads/custom-orders/'];
  
  for (const folder of requiredFolders) {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: folder,
        MaxKeys: 1
      });
      
      const response = await s3Client.send(listCommand);
      
      if (response.KeyCount > 0) {
        console.log(`   ✅ ${folder} exists`);
      } else {
        console.log(`   ⚠️  ${folder} is empty (may need files uploaded)`);
      }
    } catch (error) {
      console.log(`   ❌ ${folder} not found`);
    }
  }

  console.log('\n✨ S3 Connection Test Complete!\n');
  console.log('✅ Your backend is ready to use AWS S3 storage!');
  console.log('Start your server with: npm run dev\n');
  
  console.log('⚠️  IMPORTANT: Add IAM Policy to your user');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\nGo to AWS Console → IAM → Users → furnishop-admin → Permissions');
  console.log('Click "Add permissions" → "Create inline policy" → JSON tab');
  console.log('\nPaste this policy:\n');
  console.log(JSON.stringify({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "FurnishopS3Access",
        "Effect": "Allow",
        "Action": [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ],
        "Resource": [
          `arn:aws:s3:::${BUCKET_NAME}/*`,
          `arn:aws:s3:::${BUCKET_NAME}`
        ]
      }
    ]
  }, null, 2));
  console.log('\nSave as: FurnishopS3Policy');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  process.exit(0);
}

// Run test
testS3Connection().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
