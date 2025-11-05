# Quick Fix: IAM Permissions Issue

## Problem
Your IAM user `furnishop-admin` doesn't have the required S3 permissions.

## Solution: Add IAM Policy

### Step 1: Go to AWS Console
1. Open AWS Console: https://console.aws.amazon.com
2. Go to **IAM** service
3. Click **Users** in the left menu
4. Click on **furnishop-admin**

### Step 2: Add Permissions
1. Click the **Permissions** tab
2. Click **Add permissions** button
3. Select **Create inline policy**
4. Click the **JSON** tab

### Step 3: Paste This Policy
```json
{
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
        "arn:aws:s3:::furnishop-bucket/*",
        "arn:aws:s3:::furnishop-bucket"
      ]
    }
  ]
}
```

### Step 4: Name and Create
1. Click **Review policy**
2. Name it: `FurnishopS3Policy`
3. Click **Create policy**

### Step 5: Test Again
```bash
npm run test-s3
```

## What Each Permission Does

| Permission | Purpose |
|------------|---------|
| `s3:PutObject` | Upload files (custom order images) |
| `s3:GetObject` | Read files (verify uploads) |
| `s3:DeleteObject` | Delete files (when orders are deleted) |
| `s3:ListBucket` | List bucket contents (optional, for testing) |

## Alternative: Attach AWS Managed Policy

Instead of creating inline policy, you can attach an AWS managed policy:

1. In IAM → Users → furnishop-admin → Permissions
2. Click **Add permissions** → **Attach policies directly**
3. Search for: `AmazonS3FullAccess` (for testing)
   - ⚠️ **Note:** This gives full S3 access to ALL buckets
   - Better to use the inline policy above for production

## Verify Permissions

After adding the policy, run:
```bash
npm run test-s3
```

You should see:
- ✅ Configuration looks good
- ✅ Successfully connected to bucket
- ✅ Successfully uploaded test file
- ✅ Folders exist

## Still Having Issues?

### Check 1: Credentials are correct
```bash
# In your .env file
AWS_ACCESS_KEY_ID=AKIAWCS4...  # Must match IAM user
AWS_SECRET_ACCESS_KEY=...       # Must be correct
```

### Check 2: Region matches bucket
```bash
AWS_REGION=ap-southeast-2  # Must match where bucket was created
```

### Check 3: Bucket exists
- Go to S3 Console
- Verify `furnishop-bucket` exists
- Check it's in `ap-southeast-2` region

## Need Help?

If you're still stuck:
1. Verify IAM policy is attached to correct user
2. Wait 1-2 minutes for AWS to propagate permissions
3. Try test again: `npm run test-s3`
4. Check AWS CloudTrail for detailed error logs

---

**Estimated Fix Time:** 2-3 minutes
