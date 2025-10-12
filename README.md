# E-Commerce Backend API

Node.js/Express/MongoDB backend API for the e-commerce platform.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
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
- Body: `{ name, description, price, category, stock, image }`
- Auth: Admin only

#### Update Product (Admin)
- **PUT** `/api/products/:id`
- Auth: Admin only

#### Delete Product (Admin)
- **DELETE** `/api/products/:id`
- Auth: Admin only

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
- category: String (electronics/clothing/books/home)
- stock: Number
- image: String
- createdAt: Date

### Transaction
- userId: ObjectId (ref: User)
- products: Array of { productId, quantity, price }
- totalAmount: Number
- status: String (pending/processing/shipped/delivered/cancelled)
- shippingAddress: Object { address, city, zipCode, country }
- createdAt: Date

## Security

- Passwords are hashed using bcryptjs
- JWT tokens expire after 30 days
- Role-based access control for admin routes
- CORS enabled for cross-origin requests

## Dependencies

- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- dotenv: Environment variables
- cors: Cross-origin resource sharing
- nodemon: Development auto-reload
