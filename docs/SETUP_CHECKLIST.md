# AWS S3 Integration - Setup Checklist

Complete these steps to activate S3 integration:

## ⚙️ Configuration Steps

### 1. Environment Setup
- [ ] Create `.env` file in `furnishop-server/` directory
- [ ] Add AWS credentials to `.env`:
  ```env
  AWS_REGION=your-region (e.g., us-east-1)
  AWS_ACCESS_KEY_ID=your-access-key
  AWS_SECRET_ACCESS_KEY=your-secret-key
  AWS_S3_BUCKET_NAME=furnishop-bucket
  ```
- [ ] Verify `.env` is in `.gitignore` (should not be committed)

### 2. AWS Console Setup
- [ ] Log in to AWS Console
- [ ] Navigate to S3 service
- [ ] Verify `furnishop-bucket` exists
- [ ] Verify folder structure exists:
  - [ ] `models/` folder
  - [ ] `textures/` folder
  - [ ] `uploads/custom-orders/` folder

### 3. S3 Bucket Permissions
- [ ] Go to Bucket → Permissions tab
- [ ] Click "Bucket Policy"
- [ ] Add this policy (replace `furnishop-bucket` if needed):
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
- [ ] Click "Save changes"

### 4. S3 CORS Configuration
- [ ] Still in Permissions tab
- [ ] Scroll to "Cross-origin resource sharing (CORS)"
- [ ] Click "Edit"
- [ ] Add this configuration:
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
- [ ] Click "Save changes"

### 5. IAM User Permissions
- [ ] Go to IAM service in AWS Console
- [ ] Find your IAM user (the one whose credentials you're using)
- [ ] Verify user has S3 permissions:
  - [ ] `s3:PutObject`
  - [ ] `s3:GetObject`
  - [ ] `s3:DeleteObject`
  - [ ] `s3:ListBucket`

## 🧪 Testing Steps

### 6. Test Server Startup
- [ ] Open terminal in `furnishop-server/` directory
- [ ] Run `npm run dev`
- [ ] Verify no errors in console
- [ ] Check for "MongoDB connected successfully"
- [ ] Check for "Server is running on port 5000"

### 7. Test File Upload (Manual)
- [ ] Get a JWT token (login as user)
- [ ] Use Postman or curl to test custom order upload:
  ```bash
  curl -X POST http://localhost:5000/api/custom-orders \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -F "furnitureType=Table" \
    -F "width=100" \
    -F "height=75" \
    -F "woodType=Mahogany" \
    -F "varnishType=Oak Veneer" \
    -F "totalPrice=5000" \
    -F "images=@path/to/test-image.jpg"
  ```
- [ ] Verify response shows success
- [ ] Check S3 console for uploaded file in `uploads/custom-orders/`
- [ ] Verify MongoDB record has S3 URL (not local path)

### 8. Test File Deletion
- [ ] Login as admin
- [ ] Delete a custom order
- [ ] Verify file is removed from S3
- [ ] Verify record is removed from MongoDB

## 📊 Data Migration (If Needed)

### 9. Migrate Existing Database Records
If you have existing data with local file paths:

- [ ] Run migration script:
  ```bash
  npm run migrate-to-s3
  ```
- [ ] Verify output shows updated records
- [ ] Check a few database records manually
- [ ] Verify URLs now start with `https://furnishop-bucket.s3...`

### 10. Upload Existing Files (Optional)
If you have local model/texture files to upload:

- [ ] Verify paths in `uploadToS3.js` match your local structure
- [ ] Run upload script:
  ```bash
  npm run upload-to-s3
  ```
- [ ] Verify files appear in S3 console
- [ ] Test accessing a model URL in browser

## 🔍 Verification Steps

### 11. Final Checks
- [ ] Custom order images upload to S3 ✓
- [ ] S3 URLs stored in database ✓
- [ ] Images accessible via browser (public URL) ✓
- [ ] Delete operation removes from S3 ✓
- [ ] No local `uploads/` directory being used ✓
- [ ] Server logs show no S3-related errors ✓

### 12. Frontend Integration
- [ ] Update frontend to use S3 URLs for models
- [ ] Update frontend to use S3 URLs for textures
- [ ] Test 3D model viewer with S3 URLs
- [ ] Test custom order image display
- [ ] Verify CORS works (no browser console errors)

## 🎯 Optional Enhancements

### 13. Asset Management Routes (Optional)
If you want admin upload capabilities:

- [ ] Add to `server.js`:
  ```javascript
  app.use('/api/assets', require('./routes/assetRoutes'));
  ```
- [ ] Test model upload endpoint
- [ ] Test texture upload endpoint
- [ ] Test delete endpoint

### 14. Production Optimizations (Optional)
- [ ] Enable S3 bucket versioning
- [ ] Set up CloudFront CDN
- [ ] Configure lifecycle rules for old uploads
- [ ] Enable S3 server-side encryption
- [ ] Set up CloudWatch monitoring
- [ ] Configure automated backups

## 🐛 Troubleshooting

### If Upload Fails:
1. Check AWS credentials in `.env`
2. Verify IAM user has correct permissions
3. Check bucket policy allows PutObject
4. Verify CORS configuration
5. Check file size (default limit: 5MB)
6. Check network connectivity to AWS

### If Files Not Accessible:
1. Check bucket policy allows GetObject
2. Verify files are in correct folders
3. Check bucket public access settings
4. Test URL directly in browser
5. Check browser console for CORS errors

### If Server Won't Start:
1. Verify all environment variables are set
2. Check for syntax errors in new files
3. Verify AWS SDK packages installed
4. Check MongoDB connection
5. Review server error logs

## 📋 Summary

Total files created: **11**
- Services: 1
- Middleware: 1
- Routes: 1
- Config: 1
- Scripts: 2
- Documentation: 5

Total files modified: **3**
- `routes/customOrderRoutes.js`
- `server.js`
- `package.json`

## ✅ Completion Criteria

You're done when:
- [x] All packages installed
- [ ] AWS credentials configured
- [ ] S3 bucket properly configured
- [ ] Server starts without errors
- [ ] Custom order upload works
- [ ] Files appear in S3
- [ ] S3 URLs in database
- [ ] Delete removes from S3

---

**Need Help?**
- See `QUICK_START_S3.md` for quick setup
- See `AWS_S3_SETUP.md` for detailed guide
- See `IMPLEMENTATION_SUMMARY.md` for technical details

**Estimated Setup Time:** 15-30 minutes
