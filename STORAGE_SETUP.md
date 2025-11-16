# Supabase Storage Setup

## Issue Fixed

The upload API was failing with a **Row-Level Security (RLS) policy violation** error:

```
StorageApiError: new row violates row-level security policy
status: 400, statusCode: '403'
```

## Root Cause

The storage bucket `watermelon-images` had an RLS policy that only allowed **authenticated** users to upload:

```sql
CREATE POLICY "Authenticated users can upload watermelon images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'watermelon-images' AND 
  auth.role() = 'authenticated'
);
```

However, the demo app doesn't have authentication implemented yet, so uploads were being rejected.

## Solution Applied

### 1. Updated INSERT Policy

Replaced the restrictive policy with one that allows **public uploads** for MVP/demo:

```sql
DROP POLICY IF EXISTS "Authenticated users can upload watermelon images" ON storage.objects;

CREATE POLICY "Allow public uploads to watermelon-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'watermelon-images'
);
```

### 2. Configured Bucket Limits

Set file size limit and allowed MIME types:

```sql
UPDATE storage.buckets
SET 
  file_size_limit = 2097152, -- 2MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png']
WHERE id = 'watermelon-images';
```

## Current Storage Configuration

### Bucket: `watermelon-images`

- **Public**: Yes (files are publicly accessible via URL)
- **File Size Limit**: 2MB (2,097,152 bytes)
- **Allowed MIME Types**: `image/jpeg`, `image/png`

### RLS Policies

| Policy Name | Operation | Roles | Description |
|------------|-----------|-------|-------------|
| Allow public uploads to watermelon-images | INSERT | public | Allows anyone to upload images (for demo) |
| Watermelon images are publicly accessible | SELECT | public | Allows anyone to read/download images |
| Users can update their own watermelon images | UPDATE | public | Users can update images in their folder |
| Users can delete their own watermelon images | DELETE | public | Users can delete images in their folder |

## Security Considerations

### Current Setup (MVP/Demo)

✅ **Pros:**
- Easy to test and demo
- No authentication required
- Quick development iteration

⚠️ **Cons:**
- Anyone can upload images
- No user ownership tracking
- Potential for abuse/spam
- Storage costs could increase

### Production Recommendations

When moving to production, implement these security improvements:

#### 1. Require Authentication

```sql
DROP POLICY IF EXISTS "Allow public uploads to watermelon-images" ON storage.objects;

CREATE POLICY "Authenticated users can upload watermelon images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'watermelon-images' AND
  (storage.foldername(name))[1] = (auth.uid()::text)
);
```

#### 2. Implement Rate Limiting

- Use Vercel Edge Config or Redis for rate limiting
- Limit uploads per user per hour
- Already implemented in `/api/analyze` route

#### 3. Add File Validation

- Verify image dimensions
- Check for malicious content
- Validate file headers (not just MIME type)

#### 4. Implement Storage Quotas

- Set per-user storage limits
- Clean up old/unused images
- Implement retention policies

#### 5. Add Monitoring

- Track upload patterns
- Alert on suspicious activity
- Monitor storage usage

## Testing the Fix

1. Navigate to `/demo/analysis-flow`
2. Click "Buka Kamera"
3. Capture an image
4. Upload should now succeed ✅
5. AI analysis should proceed automatically

## File Organization

Images are stored with the following structure:

```
watermelon-images/
├── {userId}/
│   ├── {timestamp}.jpg
│   ├── {timestamp}.png
│   └── ...
```

Example: `watermelon-images/demo-user-123/1731753600000.jpg`

## API Endpoints

### Upload: `POST /api/upload`

**Request:**
```typescript
FormData {
  file: File,
  userId: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    url: string,        // Public URL
    fileName: string,   // Storage path
    size: number,       // File size in bytes
    type: string        // MIME type
  }
}
```

### Analyze: `POST /api/analyze`

**Request:**
```typescript
{
  imageUrl: string,
  userId: string,
  metadata?: {
    location?: string,
    batchId?: string,
    deviceInfo?: string
  }
}
```

## Troubleshooting

### Upload Still Failing?

1. **Check RLS policies:**
   ```sql
   SELECT policyname, cmd, roles, with_check
   FROM pg_policies
   WHERE schemaname = 'storage' 
     AND tablename = 'objects';
   ```

2. **Verify bucket exists:**
   ```sql
   SELECT * FROM storage.buckets 
   WHERE id = 'watermelon-images';
   ```

3. **Check Supabase logs:**
   - Go to Supabase Dashboard
   - Navigate to Logs → Storage
   - Look for error messages

4. **Verify environment variables:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Next Steps

- [ ] Implement user authentication (Supabase Auth)
- [ ] Update RLS policies to require authentication
- [ ] Add storage quota management
- [ ] Implement image cleanup/retention
- [ ] Add monitoring and alerts
- [ ] Set up CDN caching for images

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [RLS Policies](https://supabase.com/docs/guides/database/postgres/row-level-security)
