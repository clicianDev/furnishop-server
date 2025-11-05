# Furnishop Backend API

Node.js/Express/MongoDB backend API for the Furnishop e-commerce platform with AWS S3 integration for file storage.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment (see below)
cp .env.example .env
# Edit .env with your credentials

# Test S3 connection
npm run test-s3

# Start development server
npm run dev
```

## 📋 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Client
CLIENT_URL=http://localhost:3000

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=furnishop-bucket
```

## ☁️ AWS S3 Setup

This application uses AWS S3 for file storage. See detailed setup guides:

- **[QUICK_START_S3.md](./QUICK_START_S3.md)** - Quick setup guide (15 min)
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step checklist
- **[AWS_S3_SETUP.md](./AWS_S3_SETUP.md)** - Complete documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture diagrams

### S3 Bucket Structure
```
furnishop-bucket/
├── models/               # 3D models (public)
├── textures/            # Texture files (public)
└── uploads/
    └── custom-orders/   # Custom order images
```

## 🔧 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Available Scripts
```bash
npm run dev              # Start with nodemon
npm run start            # Start production server
npm run seed             # Seed database with products
npm run create-admin     # Create admin user
npm run test-s3          # Test S3 connection
npm run upload-to-s3     # Upload local files to S3
npm run migrate-to-s3    # Migrate DB records to S3 URLs
```

## Project Structure

```
server/
├── models/          # Mongoose models
│   ├── User.js
│   ├── Product.js
│   └── Transaction.js
├── routes/          # API routes
│   ├── userRoutes.js
│   ├── productRoutes.js
│   └── transactionRoutes.js
├── middleware/      # Custom middleware
│   └── auth.js
├── .env            # Environment variables
└── server.js       # Main application file
```

## API Documentation

### Authentication
Most protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### User Endpoints

#### Register User
- **POST** `/api/users/register`
- Body: `{ name, email, password }`

#### Login User
- **POST** `/api/users/login`
- Body: `{ email, password }`

#### Get Profile
- **GET** `/api/users/profile`
- Auth: Required

#### Get All Users (Admin)
- **GET** `/api/users`
- Auth: Admin only

#### Update User (Admin)
- **PUT** `/api/users/:id`
- Auth: Admin only

#### Delete User (Admin)
- **DELETE** `/api/users/:id`
- Auth: Admin only

### Product Endpoints

#### Get All Products
- **GET** `/api/products`
- Public

#### Get Product by ID
- **GET** `/api/products/:id`
- Public

#### Create Product (Admin)
- **POST** `/api/products`
- Body: `{ name, description, price, category, stock, image, models }`
- Auth: Admin only

#### Update Product (Admin)
- **PUT** `/api/products/:id`
- Auth: Admin only

#### Delete Product (Admin)
- **DELETE** `/api/products/:id`
- Auth: Admin only

### Custom Order Endpoints

#### Create Custom Order
- **POST** `/api/custom-orders`
- Body (multipart/form-data):
  - `furnitureType`: String (Door/Table/Cabinet/Chair/Bed)
  - `width`: Number
  - `height`: Number
  - `woodType`: String (Mahogany/Gmelina)
  - `varnishType`: String
  - `totalPrice`: Number
  - `notes`: String (optional)
  - `images`: File[] (max 5 files, 5MB each)
- Auth: Required
- **Files are uploaded directly to S3**

#### Get All Custom Orders
- **GET** `/api/custom-orders`
- Auth: Required (Admin sees all, users see their own)

#### Get Custom Order by ID
- **GET** `/api/custom-orders/:id`
- Auth: Required

#### Update Custom Order Status (Admin)
- **PUT** `/api/custom-orders/:id`
- Body: `{ status, adminNotes }`
- Auth: Admin only

#### Delete Custom Order (Admin)
- **DELETE** `/api/custom-orders/:id`
- Auth: Admin only
- **Also deletes files from S3**

### Transaction Endpoints

#### Get All Transactions (Admin)
- **GET** `/api/transactions`
- Auth: Admin only

#### Get My Orders
- **GET** `/api/transactions/my-orders`
- Auth: Required

#### Create Transaction
- **POST** `/api/transactions`
- Body: `{ products, totalAmount, shippingAddress }`
- Auth: Required

#### Update Transaction Status (Admin)
- **PUT** `/api/transactions/:id`
- Body: `{ status }`
- Auth: Admin only

## Models

### User
- name: String
- email: String (unique)
- password: String (hashed)
- role: String (user/admin)
- createdAt: Date

### Product
- name: String
- description: String
- price: Number
- category: String (Sofas/Beds/Chairs/Tables/Cabinets/Wardrobes/Doors)
- stock: Number
- image: String (S3 URL)
- models: Array of model variants
  - modelUrl: String (S3 URL)
  - price: Number
  - description: String
  - variantName: String
- createdAt: Date

### CustomOrder
- userId: ObjectId (ref: User)
- furnitureType: String (Door/Table/Cabinet/Chair/Bed)
- dimensions: Object { width, height }
- woodType: String (Mahogany/Gmelina)
- varnishType: String (Plywood/Dark Wood/Oak Veneer/Plywood Varnished)
- totalPrice: Number
- notes: String
- images: Array of Strings (S3 URLs)
- status: String (pending/reviewing/approved/in-production/completed/cancelled)
- adminNotes: String
- createdAt: Date
- updatedAt: Date

### Transaction
- userId: ObjectId (ref: User)
- products: Array of { productId, quantity, price }
- totalAmount: Number
- status: String (pending/processing/shipped/delivered/cancelled)
- shippingAddress: Object { address, city, zipCode, country }
- createdAt: Date

## Security

- Passwords are hashed using bcryptjs
- JWT tokens expire after 7 days
- Role-based access control for admin routes
- CORS enabled for cross-origin requests
- AWS S3 credentials stored in environment variables
- File uploads limited to 5MB per file
- Only image files accepted for custom orders

## Dependencies

### Core
- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- dotenv: Environment variables
- cors: Cross-origin resource sharing

### File Upload & Storage
- multer: File upload handling
- multer-s3: S3 storage engine for multer
- @aws-sdk/client-s3: AWS S3 SDK
- @aws-sdk/s3-request-presigner: Generate presigned URLs
- mime-types: File type detection

### Development
- nodemon: Development auto-reload

## Project Structure

```
furnishop-server/
├── config/
│   └── config.js           # Centralized configuration
├── middleware/
│   ├── auth.js             # JWT authentication
│   └── s3Upload.js         # S3 upload middleware
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── CustomOrder.js
│   └── Transaction.js
├── routes/
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── customOrderRoutes.js
│   ├── transactionRoutes.js
│   └── assetRoutes.js      # (Optional) Admin asset uploads
├── services/
│   └── s3Service.js        # S3 utility functions
├── createAdmin.js          # Script to create admin user
├── seedProducts.js         # Script to seed products
├── migrateToS3.js          # Script to migrate to S3 URLs
├── uploadToS3.js           # Script to bulk upload files
├── testS3Connection.js     # Script to test S3 connection
├── .env                    # Environment variables (DO NOT COMMIT)
├── .env.example            # Environment template
├── server.js               # Main application file
└── package.json
```

## 📚 Documentation Files

- **README.md** - This file (overview)
- **QUICK_START_S3.md** - Quick S3 setup guide
- **SETUP_CHECKLIST.md** - Detailed setup checklist
- **AWS_S3_SETUP.md** - Complete S3 documentation
- **ARCHITECTURE.md** - System architecture diagrams
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

## 🧪 Testing

### Test S3 Connection
```bash
npm run test-s3
```

### Test API Endpoints
```bash
# Register a user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create custom order (with file upload)
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

## 🚀 Deployment

### Environment Setup
1. Set up MongoDB (Atlas or self-hosted)
2. Create AWS S3 bucket and configure permissions
3. Set all environment variables
4. Deploy to hosting platform (Heroku, Railway, Render, etc.)

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] MongoDB connection tested
- [ ] S3 bucket configured and tested
- [ ] Admin user created
- [ ] Products seeded (optional)
- [ ] CORS origins updated for production
- [ ] JWT secret is secure

## 📄 License

ISC

## 👥 Support

For issues or questions:
1. Check the documentation files
2. Review the setup checklist
3. Test S3 connection with `npm run test-s3`
4. Check server logs for detailed errors

---

**Last Updated:** November 5, 2025  
**Version:** 2.0.0 (with AWS S3 integration)
