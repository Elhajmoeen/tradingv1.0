# Avatar Upload Backend Implementation Guide

This document outlines the backend API endpoints needed to support the avatar upload functionality.

## Environment Configuration

Add these environment variables to your backend:

```env
# Avatar Upload Settings
MAX_AVATAR_SIZE_MB=5
UPLOAD_MODE=multipart  # or "presigned"
AVATAR_STORAGE_PATH=/uploads/avatars
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp
```

## API Endpoints

### Option A: Multipart Upload (Recommended for smaller deployments)

#### POST /api/users/me/avatar

**Description**: Upload avatar using multipart/form-data

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Headers: Authorization: Bearer {token}
- Body: FormData with 'file' field

**Response**:
```json
{
  "avatarUrl": "https://yourdomain.com/uploads/avatars/user_123.webp"
}
```

**Error Responses**:
```json
// File too large
{ "error": "File size exceeds 5MB limit", "status": 413 }

// Invalid file type
{ "error": "Invalid file type. Only images allowed.", "status": 400 }

// Server error
{ "error": "Upload failed", "status": 500 }
```

### Option B: Presigned Upload (Recommended for cloud deployments)

#### POST /api/users/me/avatar/upload-ticket

**Description**: Get presigned upload URL

**Request**:
- Method: POST
- Headers: Authorization: Bearer {token}

**Response**:
```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/signed-url",
  "publicUrl": "https://cdn.yourdomain.com/avatars/user_123.webp",
  "headers": {
    "Content-Type": "image/png"
  }
}
```

#### POST /api/users/me/avatar

**Description**: Confirm avatar upload after presigned upload

**Request**:
```json
{
  "publicUrl": "https://cdn.yourdomain.com/avatars/user_123.webp"
}
```

**Response**:
```json
{
  "avatarUrl": "https://cdn.yourdomain.com/avatars/user_123.webp"
}
```

## Implementation Notes

### Security Considerations
- Validate file size (max 5MB)
- Validate MIME types (image/jpeg, image/png, image/webp)
- Strip EXIF data from images
- Generate unique filenames to prevent conflicts
- Sanitize file uploads to prevent malicious content

### Storage Recommendations
- **Local Storage**: Store in `/uploads/avatars/` with proper permissions
- **Cloud Storage**: Use S3, Google Cloud Storage, or Azure Blob Storage
- **CDN**: Serve images through CDN for better performance

### Database Updates
Update the user record with the new avatar URL:

```sql
UPDATE users SET avatar_url = ? WHERE id = ?
```

### Image Processing (Optional)
Consider implementing:
- Automatic resizing to standard dimensions (e.g., 200x200px)
- Format conversion to WebP for smaller file sizes
- Thumbnail generation for different sizes

### Example Node.js/Express Implementation

```javascript
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

app.post('/api/users/me/avatar', authenticate, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;
    const fileName = `user_${userId}_${Date.now()}.webp`;
    const filePath = path.join('/uploads/avatars', fileName);
    
    // Process and save image
    await sharp(req.file.buffer)
      .resize(200, 200)
      .webp({ quality: 85 })
      .toFile(filePath);
    
    const avatarUrl = `${process.env.BASE_URL}/uploads/avatars/${fileName}`;
    
    // Update user record
    await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);
    
    res.json({ avatarUrl });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

## Frontend Integration

The frontend is already configured to work with both upload modes. Set the environment variable:

```env
VITE_UPLOAD_MODE=multipart  # or "presigned"
VITE_MAX_AVATAR_MB=5
```

## Testing

1. **File Size**: Test with files > 5MB (should reject)
2. **File Type**: Test with non-image files (should reject)
3. **Valid Upload**: Test with valid images (should succeed)
4. **UI Updates**: Verify avatar updates immediately after upload
5. **Persistence**: Verify avatar persists after page refresh