# AWS S3 Integration Setup Guide

## Overview
The backend has been updated to use AWS S3 for file storage instead of local file system. All uploads (custom orders, models, textures) are now stored in the `furnishop-bucket` S3 bucket.

## Structure in S3
```
furnishop-bucket/
├── models/
│   ├── cabinet/
│   ├── mini-cabinet/
│   ├── shelf/
│   ├── table/
│   └── work-table/
├── textures/
│   ├── dark_wood/
│   ├── oak_veener/
│   ├── plywood/
│   └── plywood_varnished/
└── uploads/
    └── custom-orders/
```

## Setup Instructions

### 1. Configure Environment Variables
Add the following to your `.env` file:

```env
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET_NAME=furnishop-bucket
```

### 2. AWS IAM Permissions
Your AWS IAM user needs the following S3 permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::furnishop-bucket/*",
        "arn:aws:s3:::furnishop-bucket"
      ]
    }
  ]
}
```

### 3. S3 Bucket Configuration

#### Bucket Policy (for public read access to models and textures):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::furnishop-bucket/models/*",
        "arn:aws:s3:::furnishop-bucket/textures/*"
      ]
    }
  ]
}
```

#### CORS Configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## Changes Made

### 1. New Dependencies
- `@aws-sdk/client-s3` - AWS SDK for S3 operations
- `@aws-sdk/s3-request-presigner` - Generate presigned URLs
- `multer-s3` - Multer storage engine for S3

### 2. New Files
- `services/s3Service.js` - S3 utility functions (upload, delete, presigned URLs)
- `middleware/s3Upload.js` - Multer-S3 middleware for file uploads

### 3. Updated Files
- `routes/customOrderRoutes.js` - Now uses S3 for image uploads
- `server.js` - Removed local static file serving
- `.env.example` - Added AWS configuration variables

## Usage

### Uploading Custom Order Images
```javascript
// Endpoint: POST /api/custom-orders
// Files are automatically uploaded to S3
// URLs are stored in database as full S3 URLs
```

### Uploading Models/Textures
You can use the middleware for other routes:
```javascript
const { uploadModels, uploadTextures } = require('../middleware/s3Upload');

router.post('/upload-model', uploadModels.single('model'), (req, res) => {
  res.json({ url: req.file.location });
});
```

### Deleting Files
```javascript
const { deleteFromS3, extractKeyFromUrl } = require('../services/s3Service');

const key = extractKeyFromUrl(s3Url);
await deleteFromS3(key);
```

## Testing

1. Start the server:
```bash
npm run dev
```

2. Test file upload:
```bash
curl -X POST http://localhost:5000/api/custom-orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "furnitureType=Table" \
  -F "width=100" \
  -F "height=75" \
  -F "woodType=Mahogany" \
  -F "varnishType=Oak Veneer" \
  -F "totalPrice=5000" \
  -F "images=@/path/to/image.jpg"
```

3. Verify the file appears in your S3 bucket

## Migration Notes

### For Existing Data
If you have existing local files that need to be migrated to S3:

1. The folder structure has already been imported to S3 (as per your screenshot)
2. Update database records to use S3 URLs instead of local paths:

```javascript
// Migration script example
const products = await Product.find({});
for (let product of products) {
  if (product.image && !product.image.startsWith('http')) {
    product.image = `https://furnishop-bucket.s3.${process.env.AWS_REGION}.amazonaws.com/${product.image}`;
    await product.save();
  }
}
```

## Troubleshooting

### Access Denied Error
- Verify AWS credentials in `.env`
- Check IAM user permissions
- Verify bucket policy allows required actions

### Files Not Accessible
- Check bucket public access settings
- Verify CORS configuration
- Ensure files are uploaded to correct paths

### Large File Uploads
- Default limit is 5MB per file
- Adjust in `middleware/s3Upload.js` if needed:
```javascript
limits: {
  fileSize: 10 * 1024 * 1024 // 10MB
}
```

## Security Recommendations

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use IAM roles** - For EC2/Lambda deployments
3. **Enable bucket versioning** - Protect against accidental deletions
4. **Enable server-side encryption** - Protect data at rest
5. **Use presigned URLs** - For private content access
6. **Set up lifecycle rules** - Automatically delete old files

## Cost Optimization

1. **Use S3 Standard-IA** - For infrequently accessed files
2. **Enable intelligent tiering** - Automatic cost optimization
3. **Set up lifecycle policies** - Move old uploads to cheaper storage
4. **Monitor usage** - Use AWS Cost Explorer
