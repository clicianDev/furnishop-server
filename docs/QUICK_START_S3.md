# Quick Start: AWS S3 Integration

## Prerequisites
✅ AWS S3 bucket created: `furnishop-bucket`
✅ Existing folder structure imported to S3 (models/, textures/, uploads/)

## Step-by-Step Setup

### 1. Add AWS Credentials to .env
Create a `.env` file in the server root and add:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
AWS_S3_BUCKET_NAME=furnishop-bucket
```

Replace with your actual AWS credentials.

### 2. Configure S3 Bucket Permissions

#### Make models and textures publicly accessible:
Go to AWS S3 Console → furnishop-bucket → Permissions → Bucket Policy

Add this policy:
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

#### Enable CORS:
Go to Permissions → CORS configuration

Add this:
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

### 3. Test the Integration

Start your server:
```bash
npm run dev
```

The server will now:
- ✅ Upload custom order images directly to S3
- ✅ Store S3 URLs in database
- ✅ Delete from S3 when orders are removed

### 4. (Optional) Migrate Existing Data

If you have existing database records with local file paths:
```bash
npm run migrate-to-s3
```

This will update all database records to use S3 URLs.

### 5. (Optional) Upload Files from Client

If you want to upload the models/textures from your client folder:
```bash
npm run upload-to-s3
```

## Testing Custom Orders

Using curl:
```bash
curl -X POST http://localhost:5000/api/custom-orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "furnitureType=Table" \
  -F "width=100" \
  -F "height=75" \
  -F "woodType=Mahogany" \
  -F "varnishType=Oak Veneer" \
  -F "totalPrice=5000" \
  -F "images=@/path/to/image.jpg"
```

The image will be uploaded to: `s3://furnishop-bucket/uploads/custom-orders/custom-{timestamp}.jpg`

## File Structure in S3

```
furnishop-bucket/
├── models/
│   ├── cabinet/
│   │   ├── cabinet.glb
│   │   └── ...
│   ├── mini-cabinet/
│   ├── shelf/
│   ├── table/
│   └── work-table/
├── textures/
│   ├── dark_wood/
│   │   ├── diffuse.jpg
│   │   ├── normal.jpg
│   │   └── roughness.jpg
│   ├── oak_veener/
│   ├── plywood/
│   └── plywood_varnished/
└── uploads/
    └── custom-orders/
        └── custom-1762353889564-554778493.jpg
```

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | `furnishop-bucket` |

## Troubleshooting

### "Access Denied" Error
- Check AWS credentials in `.env`
- Verify IAM user has S3 permissions
- Check bucket policy allows PutObject/GetObject

### Files Not Visible
- Check bucket public access settings
- Verify CORS configuration
- Check file paths in database match S3 structure

### Upload Fails
- Check file size (default limit: 5MB)
- Verify network connection
- Check AWS service status

## Next Steps

1. ✅ Update your frontend to use S3 URLs for models and textures
2. ✅ Test custom order uploads
3. ✅ Monitor S3 usage in AWS Console
4. ✅ Set up backup/lifecycle policies if needed

## Support

For detailed documentation, see `AWS_S3_SETUP.md`

For AWS SDK issues, check: https://docs.aws.amazon.com/sdk-for-javascript/v3/
