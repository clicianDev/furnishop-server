# Product File Upload Guide

## Overview
Products now support file uploads for images and 3D models directly to AWS S3, replacing the previous URL-based system.

## File Structure in S3

When creating a product named "Sample Product", the files will be organized as follows:

```
furnishop-bucket/
└── models/
    └── Sample-Product/
        ├── sample-product-1.glb
        ├── sample-product-2.glb
        └── images/
            ├── image-1.jpg
            ├── image-2.png
            └── image-3.jpeg
```

## Naming Convention

### Product Name Sanitization
- Special characters are removed (except spaces and hyphens)
- Spaces are replaced with hyphens (-)
- Multiple hyphens are consolidated to single hyphen
- Example: "Modern Sofa #1!" → "Modern-Sofa-1"

### File Naming
- **Images**: `image-{counter}.{ext}` (e.g., image-1.jpg, image-2.png)
- **Models**: `{lowercase-product-name}-{counter}.glb` (e.g., sample-product-1.glb)

### Counters
- Counters increment with each upload (1, 2, 3, etc.)
- Image counter increments for each new product image
- Model counter increments for each 3D model variant

## Supported File Types

### Images
- **Allowed**: JPG, JPEG, PNG
- **Max Size**: 10MB per file
- **Use Case**: Product display images

### 3D Models
- **Allowed**: GLB (GLTF Binary)
- **Max Size**: 50MB per file
- **Use Case**: 3D model variants for AR/3D viewer

## API Endpoints

### Upload Product Image
```
POST /api/products/upload-image
Headers:
  - Authorization: Bearer {admin_token}
  - Content-Type: multipart/form-data
Body:
  - image: File (required)
  - name: String (required) - Product name
  - imageIndex: String (optional) - Image counter
Response:
  {
    "message": "Image uploaded successfully",
    "imageUrl": "https://furnishop-bucket.s3.ap-southeast-2.amazonaws.com/models/Product-Name/images/image-1.jpg",
    "key": "models/Product-Name/images/image-1.jpg"
  }
```

### Upload Product 3D Model
```
POST /api/products/upload-model
Headers:
  - Authorization: Bearer {admin_token}
  - Content-Type: multipart/form-data
Body:
  - model: File (required)
  - productName: String (required) - Product name
  - modelIndex: String (optional) - Model counter
Response:
  {
    "message": "Model uploaded successfully",
    "modelUrl": "https://furnishop-bucket.s3.ap-southeast-2.amazonaws.com/models/Product-Name/product-name-1.glb",
    "key": "models/Product-Name/product-name-1.glb"
  }
```

### Create Product
```
POST /api/products
Headers:
  - Authorization: Bearer {admin_token}
  - Content-Type: application/json
Body:
  {
    "name": "Sample Product",
    "description": "Product description",
    "price": 1000,
    "category": "Tables",
    "stock": 10,
    "image": "https://furnishop-bucket.s3.../models/Sample-Product/images/image-1.jpg",
    "models": [
      {
        "variantName": "Style 1",
        "modelUrl": "https://furnishop-bucket.s3.../models/Sample-Product/sample-product-1.glb",
        "price": 1000,
        "description": "Modern style variant"
      }
    ]
  }
```

## Frontend Usage (Admin Panel)

### Adding a New Product
1. Click "Add Product" button
2. Fill in product details (Name is required for uploads)
3. **Upload Product Image**:
   - Click "Choose File" under Product Image
   - Select JPG/JPEG/PNG file
   - Preview will appear below
4. **Add 3D Model Variants**:
   - Fill in variant details
   - Select GLB file for model
   - Click "Add Model Variant" (uploads immediately)
   - Repeat for multiple variants
5. Click "Add Product" to create the product

### Important Notes
- Product name must be entered before uploading files
- Each model upload happens immediately when clicking "Add Model Variant"
- Image upload happens when submitting the form
- File validation occurs client-side and server-side
- All uploaded files are stored with the sanitized product name

## Security
- Only admin users can upload files
- File type validation on both client and server
- File size limits enforced
- Automatic content-type detection
- Files stored in organized structure

## Error Handling
- Invalid file types are rejected with clear error messages
- File size limits display user-friendly alerts
- Upload failures are logged and reported to user
- Missing required fields prevent upload
