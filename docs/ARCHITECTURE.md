# System Architecture - AWS S3 Integration

## Before Integration (Local Storage)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│  (React App - furnishop-client)                            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests
                     │ (multipart/form-data)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER                          │
│  (furnishop-server - Port 5000)                            │
│                                                             │
│  ┌──────────────────────────────────────┐                  │
│  │         Multer Middleware            │                  │
│  │  (Local Disk Storage)                │                  │
│  │  - Saves to ./uploads/custom-orders/ │                  │
│  └──────────────┬───────────────────────┘                  │
│                 │                                           │
│                 │ File Path: "uploads/custom-orders/..."   │
│                 ▼                                           │
│  ┌──────────────────────────────────────┐                  │
│  │         MongoDB                      │                  │
│  │  - Stores local file paths           │                  │
│  └──────────────────────────────────────┘                  │
│                                                             │
│  ┌──────────────────────────────────────┐                  │
│  │     Local File System                │                  │
│  │  ./uploads/custom-orders/            │                  │
│  │    ├── custom-123.jpg                │                  │
│  │    └── custom-456.jpg                │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘

Problems:
❌ Files stored on server disk
❌ Lost when server restarts/scales
❌ Manual backup required
❌ Limited to single server
❌ No CDN integration
```

## After Integration (AWS S3)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│  (React App - furnishop-client)                            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests
                     │ (multipart/form-data)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER                          │
│  (furnishop-server - Port 5000)                            │
│                                                             │
│  ┌──────────────────────────────────────┐                  │
│  │    Multer-S3 Middleware              │                  │
│  │  (Direct S3 Upload)                  │                  │
│  │  - middleware/s3Upload.js            │                  │
│  └──────────────┬───────────────────────┘                  │
│                 │                                           │
│                 │ S3 URL: "https://furnishop-bucket.s3..." │
│                 ▼                                           │
│  ┌──────────────────────────────────────┐                  │
│  │         MongoDB                      │                  │
│  │  - Stores S3 URLs                    │                  │
│  │  - No local file paths               │                  │
│  └──────────────────────────────────────┘                  │
│                                                             │
│  ┌──────────────────────────────────────┐                  │
│  │      S3 Service                      │                  │
│  │  (services/s3Service.js)             │                  │
│  │  - Upload to S3                      │                  │
│  │  - Delete from S3                    │                  │
│  │  - Generate presigned URLs           │                  │
│  └──────────────┬───────────────────────┘                  │
│                 │                                           │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  │ AWS SDK
                  │ (@aws-sdk/client-s3)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      AWS S3 BUCKET                          │
│                   (furnishop-bucket)                        │
│                                                             │
│  models/                                                    │
│  ├── cabinet/                                               │
│  │   ├── cabinet.glb                                       │
│  │   └── ...                                               │
│  ├── table/                                                 │
│  └── ...                                                    │
│                                                             │
│  textures/                                                  │
│  ├── dark_wood/                                             │
│  │   ├── diffuse.jpg                                       │
│  │   ├── normal.jpg                                        │
│  │   └── roughness.jpg                                     │
│  └── ...                                                    │
│                                                             │
│  uploads/                                                   │
│  └── custom-orders/                                         │
│      ├── custom-1762353889564-554778493.jpg                │
│      └── ...                                                │
│                                                             │
│  [Public Access for models/ and textures/]                 │
│  [Private Access for uploads/custom-orders/]               │
└─────────────────────────────────────────────────────────────┘
                  │
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER / CLIENT                        │
│  - Loads 3D models from S3                                 │
│  - Loads textures from S3                                  │
│  - Displays custom order images from S3                    │
└─────────────────────────────────────────────────────────────┘

Benefits:
✅ Scalable storage
✅ 99.999999999% durability
✅ Global availability
✅ Can add CloudFront CDN
✅ Automatic backups
✅ Pay-per-use pricing
```

## Data Flow Diagrams

### 1. Custom Order Upload Flow

```
User
  │
  │ 1. Submits form with images
  ▼
Frontend (React)
  │
  │ 2. POST /api/custom-orders
  │    FormData with images
  ▼
Express Server
  │
  │ 3. Auth middleware (protect)
  ▼
Multer-S3 Middleware
  │
  │ 4. Stream upload to S3
  ▼
AWS S3
  │
  │ 5. Returns S3 URL
  ▼
Custom Order Controller
  │
  │ 6. Save order with S3 URLs
  ▼
MongoDB
  │
  │ 7. Return success + order data
  ▼
Frontend
  │
  │ 8. Display confirmation
  ▼
User
```

### 2. File Access Flow

```
Browser
  │
  │ 1. Request image/model
  │    GET https://furnishop-bucket.s3.amazonaws.com/...
  ▼
AWS S3
  │
  │ 2. Check bucket policy
  │    - models/* → Public ✓
  │    - textures/* → Public ✓
  │    - uploads/* → Private ✗ (needs auth)
  ▼
Return File
  │
  │ 3. Stream file to browser
  ▼
Browser
  │
  │ 4. Display image/load model
  ▼
User
```

### 3. File Delete Flow

```
Admin
  │
  │ 1. Delete custom order
  ▼
Frontend
  │
  │ 2. DELETE /api/custom-orders/:id
  ▼
Express Server
  │
  │ 3. Auth + Admin check
  ▼
Custom Order Controller
  │
  │ 4. Get order from MongoDB
  ▼
S3 Service
  │
  │ 5. Extract S3 key from URL
  │ 6. Delete from S3
  ▼
MongoDB
  │
  │ 7. Delete order record
  ▼
Frontend
  │
  │ 8. Show success message
  ▼
Admin
```

## File Organization

### Backend Structure
```
furnishop-server/
├── config/
│   └── config.js              # Centralized config
├── middleware/
│   ├── auth.js                # Existing auth
│   └── s3Upload.js            # NEW: S3 upload middleware
├── models/
│   ├── CustomOrder.js         # Updated to use S3 URLs
│   └── Product.js             # Updated to use S3 URLs
├── routes/
│   ├── customOrderRoutes.js   # UPDATED: Uses S3
│   └── assetRoutes.js         # NEW: Optional admin uploads
├── services/
│   └── s3Service.js           # NEW: S3 utilities
├── scripts/
│   ├── migrateToS3.js         # NEW: DB migration
│   └── uploadToS3.js          # NEW: Bulk upload
├── .env                        # UPDATED: AWS credentials
├── .env.example               # NEW: Template
└── server.js                  # UPDATED: Removed static uploads
```

### S3 Bucket Structure
```
furnishop-bucket/
├── models/                    # Public read access
│   ├── cabinet/
│   ├── mini-cabinet/
│   ├── shelf/
│   ├── table/
│   └── work-table/
├── textures/                  # Public read access
│   ├── dark_wood/
│   ├── oak_veener/
│   ├── plywood/
│   └── plywood_varnished/
└── uploads/                   # Private (auth required)
    └── custom-orders/
```

## Security Model

### Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                     S3 Bucket Policy                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  models/*        → Public Read  ✓                          │
│  textures/*      → Public Read  ✓                          │
│  uploads/*       → No Public Access                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     IAM Permissions                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Backend IAM User:                                          │
│  - s3:PutObject    → Upload files                          │
│  - s3:GetObject    → Read files                            │
│  - s3:DeleteObject → Delete files                          │
│  - s3:ListBucket   → List bucket contents                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Application Auth                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Upload custom order:  → JWT + User auth                   │
│  Delete custom order:  → JWT + Admin role                  │
│  Upload model/texture: → JWT + Admin role (optional)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables

```
┌──────────────────────────────────────────────────────────┐
│                      .env File                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  # MongoDB                                               │
│  MONGODB_URI=mongodb://localhost:27017/ecommerce        │
│                                                          │
│  # JWT                                                   │
│  JWT_SECRET=your_secret_key                             │
│                                                          │
│  # AWS S3 (NEW)                                         │
│  AWS_REGION=us-east-1                                   │
│  AWS_ACCESS_KEY_ID=AKIA...                              │
│  AWS_SECRET_ACCESS_KEY=wJal...                          │
│  AWS_S3_BUCKET_NAME=furnishop-bucket                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    NPM Packages                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Existing:                                                  │
│  - express          (Web framework)                         │
│  - mongoose         (MongoDB ORM)                           │
│  - jsonwebtoken     (Authentication)                        │
│  - multer           (File upload base)                      │
│                                                             │
│  NEW:                                                       │
│  - @aws-sdk/client-s3              (AWS S3 SDK)            │
│  - @aws-sdk/s3-request-presigner   (Signed URLs)           │
│  - multer-s3                       (S3 storage engine)      │
│  - mime-types                      (File type detection)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Cost Structure

```
┌─────────────────────────────────────────────────────────────┐
│                  AWS S3 Pricing (us-east-1)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Storage:      $0.023 per GB/month                         │
│  PUT requests: $0.005 per 1,000 requests                   │
│  GET requests: $0.0004 per 1,000 requests                  │
│                                                             │
│  Example: 10GB + 10k uploads + 100k downloads              │
│  = $0.23 + $0.05 + $0.04 = $0.32/month                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Diagram Version:** 1.0  
**Last Updated:** November 5, 2025  
**Status:** Production Ready
