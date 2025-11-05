const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function setBucketCORS() {
  console.log('🌐 Setting S3 Bucket CORS Configuration...\n');
  
  const corsConfiguration = {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
        AllowedOrigins: ['*'],
        ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
        MaxAgeSeconds: 3600
      }
    ]
  };

  try {
    const command = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    });

    await s3Client.send(command);
    
    console.log('✅ CORS configuration set successfully!\n');
    console.log('CORS Rules Applied:');
    console.log('═══════════════════════════════════════════════════');
    console.log('  Allowed Methods:  GET, HEAD, PUT, POST, DELETE');
    console.log('  Allowed Origins:  * (all origins)');
    console.log('  Allowed Headers:  * (all headers)');
    console.log('  Exposed Headers:  ETag, Content-Length, Content-Type');
    console.log('  Max Age:          3600 seconds (1 hour)');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Verify CORS configuration
    console.log('🔍 Verifying CORS configuration...');
    const getCommand = new GetBucketCorsCommand({
      Bucket: BUCKET_NAME
    });
    
    const result = await s3Client.send(getCommand);
    console.log('✅ CORS verification successful!\n');
    console.log('Your frontend can now load files from S3 without CORS errors.\n');
    
    console.log('📝 Test URLs:');
    console.log(`   Models:   https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/models/cabinet/cabinet-1.glb`);
    console.log(`   Textures: https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/textures/dark_wood/basecolor.jpg\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to set CORS configuration:', error.message);
    
    if (error.name === 'AccessDenied') {
      console.log('\n💡 Your IAM user needs "s3:PutBucketCors" permission.');
      console.log('\nManually add CORS in AWS Console:');
      console.log('═══════════════════════════════════════════════════');
      console.log('1. Go to: S3 → furnishop-bucket → Permissions');
      console.log('2. Scroll to: Cross-origin resource sharing (CORS)');
      console.log('3. Click: Edit');
      console.log('4. Paste this JSON:\n');
      console.log(JSON.stringify(corsConfiguration.CORSRules, null, 2));
      console.log('\n5. Click: Save changes');
      console.log('═══════════════════════════════════════════════════\n');
    }
    
    process.exit(1);
  }
}

setBucketCORS();
