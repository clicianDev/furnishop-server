# Fix S3 Access Issues - Step by Step Guide

## Current Status
✅ Database migrated to S3 URLs  
✅ Files uploaded to S3  
❌ Files not publicly accessible (403 Forbidden)  

## Problem
Your S3 bucket has "Block Public Access" enabled, which prevents files from being accessed.

---

## Solution: Enable Public Access for Models & Textures

### Step 1: Disable Block Public Access

1. **Go to AWS Console** → **S3**
2. Click on **furnishop-bucket**
3. Go to **Permissions** tab
4. Find **Block public access (bucket settings)**
5. Click **Edit**
6. **Uncheck** the box for **"Block all public access"**
   - OR uncheck only: **"Block public access to buckets and objects granted through new public bucket or access point policies"**
7. Type `confirm` in the box
8. Click **Save changes**

⚠️ **Security Note:** We're only making models and textures public, NOT user uploads.

---

### Step 2: Add Bucket Policy

1. Still in **Permissions** tab
2. Scroll down to **Bucket policy**
3. Click **Edit**
4. Paste this policy:

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

5. Click **Save changes**

---

### Step 3: Verify Access

Run this command to test:

```bash
curl -I "https://furnishop-bucket.s3.ap-southeast-2.amazonaws.com/models/cabinet/cabinet-1.glb"
```

You should see:
```
HTTP/1.1 200 OK
```

Instead of:
```
HTTP/1.1 403 Forbidden
```

---

### Step 4: Restart Your Frontend

```bash
# In furnishop-client directory
npm start
```

The 3D models should now load! ✨

---

## What This Does

### Public Access (Anyone can view):
- ✅ `/models/*` - All 3D model files
- ✅ `/textures/*` - All texture files

### Private Access (Auth required):
- 🔒 `/uploads/custom-orders/*` - User upload images
- 🔒 All other files

---

## Visual Guide

### Before (403 Forbidden):
```
Browser → S3 URL
        ↓
    ❌ ACCESS DENIED
```

### After (200 OK):
```
Browser → S3 URL
        ↓
    ✅ FILE DELIVERED
```

---

## Alternative: CloudFront CDN (Optional)

For better performance, you can set up CloudFront:

1. **Create CloudFront Distribution**
   - Origin: `furnishop-bucket.s3.ap-southeast-2.amazonaws.com`
   - Origin Path: `/`
   - Viewer Protocol: Redirect HTTP to HTTPS

2. **Update URLs in Code**
   - Replace: `https://furnishop-bucket.s3.ap-southeast-2.amazonaws.com`
   - With: `https://your-cloudfront-id.cloudfront.net`

Benefits:
- 🚀 Faster loading (CDN caching)
- 🌍 Global edge locations
- 💰 Lower S3 costs

---

## Troubleshooting

### Still getting 403?
1. Wait 1-2 minutes for AWS changes to propagate
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try incognito/private window
4. Check bucket policy is saved correctly

### Getting CORS errors?
Add CORS configuration in bucket:

1. S3 → furnishop-bucket → Permissions → CORS
2. Add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## Security Best Practices

✅ **What we did:**
- Made ONLY models and textures public
- Kept user uploads private
- Used specific Resource paths

❌ **What we avoided:**
- Making entire bucket public
- Exposing sensitive data
- Allowing public uploads

---

## Quick Test URLs

Try opening these in your browser:

```
https://furnishop-bucket.s3.ap-southeast-2.amazonaws.com/models/cabinet/cabinet-1.glb
https://furnishop-bucket.s3.ap-southeast-2.amazonaws.com/textures/dark_wood/diffuse.jpg
```

Should download/display the files ✓

---

**Estimated Time:** 5 minutes  
**Difficulty:** Easy  

Once done, run: `npm start` in your frontend and test! 🎉
