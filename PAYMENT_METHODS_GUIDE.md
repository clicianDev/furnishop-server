# Payment Methods Management - Implementation Summary

## Overview
Added a new **Payment Methods** management feature in the admin panel for managing eWallet payment options (GCash and PayMaya).

## Backend Implementation

### 1. Database Model
**File**: `/models/PaymentMethod.js`

Schema fields:
- `serviceProvider`: String (enum: 'GCash', 'PayMaya')
- `type`: String (enum: 'eWallet')
- `accountNumber`: String (validated format: +63XXXXXXXXXX)
- `accountName`: String
- `qrImage`: String (S3 URL)
- `isActive`: Boolean (default: true)
- `timestamps`: createdAt, updatedAt

### 2. S3 Upload Middleware
**File**: `/middleware/s3Upload.js`

Added `uploadPaymentQR` middleware:
- Accepts: JPG, JPEG, PNG, HEIC/HEIF (iPhone format)
- Max file size: 5MB
- S3 path format: `payment-qr/{provider}-{timestamp}.{ext}`
- Example: `payment-qr/gcash-1699276800000.jpg`

### 3. API Routes
**File**: `/routes/paymentMethodRoutes.js`

Endpoints:
- `GET /api/payment-methods` - Get all active payment methods (Public)
- `GET /api/payment-methods/all` - Get all payment methods including inactive (Admin)
- `GET /api/payment-methods/:id` - Get payment method by ID (Public)
- `POST /api/payment-methods/upload-qr` - Upload QR code to S3 (Admin)
- `POST /api/payment-methods` - Create new payment method (Admin)
- `PUT /api/payment-methods/:id` - Update payment method (Admin)
- `DELETE /api/payment-methods/:id` - Delete payment method and QR from S3 (Admin)

### 4. Server Registration
**File**: `/server.js`

Added route registration:
```javascript
app.use('/api/payment-methods', require('./routes/paymentMethodRoutes'));
```

## Frontend Implementation

### 1. Payment Methods Page
**File**: `/src/pages/AdminPaymentMethods.js`

Features:
- Table view with columns: Service Provider, Type, Account Number, Account Name, QR Image, Status, Actions
- Add/Edit modal with form validation
- QR image upload with preview
- Delete confirmation modal
- Account number validation (+63 format)
- File type validation (JPG, JPEG, PNG, HEIC)
- Active/inactive status toggle

### 2. Styling
**File**: `/src/pages/AdminPaymentMethods.css`

Includes:
- Responsive table design
- Provider badges (GCash: blue, PayMaya: green)
- QR thumbnail with hover zoom effect
- Status badges (Active: green, Inactive: red)
- Form styles with file input and preview
- Mobile responsive layout

### 3. Routing
**File**: `/src/App.js`

Added route:
```javascript
<Route path="/admin/payment-methods" element={<AdminPaymentMethods />} />
```

### 4. Navigation
**File**: `/src/components/AdminSidebar.js`

Added menu item:
- Icon: Credit card
- Label: "Payment Methods"
- Path: /admin/payment-methods

## Validation Rules

### Account Number
- **Format**: `+63XXXXXXXXXX` (Philippine phone number)
- **Validation**: Must start with +63 followed by exactly 10 digits
- **Example**: +639123456789

### QR Image Upload
- **Allowed formats**: JPG, JPEG, PNG, HEIC, HEIF
- **Max file size**: 5MB
- **Preview**: Shows before upload
- **Storage**: AWS S3 under `payment-qr/` folder

### Form Validation
- All fields are required
- Service Provider: Dropdown (GCash, PayMaya)
- Type: Fixed to "eWallet"
- Account Number: Real-time validation with +63 prefix
- Account Name: Text input
- QR Image: File upload with preview

## File Upload Flow

1. User selects QR image file
2. File validation (type, size)
3. Preview displayed in modal
4. On form submit:
   - QR image uploaded to S3 first
   - Returns S3 URL
   - Payment method created/updated with S3 URL
5. Old QR image deleted from S3 when updating

## S3 Structure

```
furnishop-bucket/
└── payment-qr/
    ├── gcash-1699276800000.jpg
    ├── gcash-1699276801000.png
    ├── paymaya-1699276802000.jpg
    └── ...
```

## Security Features

- Admin authentication required for all write operations
- File type validation on both client and server
- File size limits enforced
- Account number format validation
- Automatic cleanup of old QR images when updating/deleting

## Usage Instructions

### Adding a Payment Method
1. Navigate to Admin > Payment Methods
2. Click "Add Payment Method"
3. Select Service Provider (GCash/PayMaya)
4. Enter Account Number (+63XXXXXXXXXX)
5. Enter Account Name
6. Upload QR code image
7. Review preview
8. Click "Add Method"

### Editing a Payment Method
1. Click edit icon on table row
2. Modify fields as needed
3. Optionally upload new QR code
4. Toggle active/inactive status
5. Click "Update Method"

### Deleting a Payment Method
1. Click delete icon on table row
2. Confirm deletion in modal
3. Payment method and QR image removed from database and S3

## Testing Checklist

- [ ] Create GCash payment method
- [ ] Create PayMaya payment method
- [ ] Upload QR codes (JPG, PNG, HEIC formats)
- [ ] Verify account number validation
- [ ] Edit existing payment method
- [ ] Upload new QR code (verify old one deleted)
- [ ] Toggle active/inactive status
- [ ] Delete payment method
- [ ] Verify QR images display in table
- [ ] Test mobile responsiveness
- [ ] Verify S3 folder structure

## Notes

- QR images are stored permanently in S3
- When updating QR image, old image is automatically deleted
- When deleting payment method, QR image is removed from S3
- Public endpoint available for checkout page integration
- iPhone HEIC format supported for iOS users
