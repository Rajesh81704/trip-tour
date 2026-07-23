# Cloudflare R2 CORS Configuration

The browser uploads files **directly** to R2 using presigned PUT URLs.
For this to work, the R2 bucket must allow cross-origin PUT requests.

## How to set it up

1. Go to **Cloudflare Dashboard → R2 → trip-tour bucket → Settings → CORS policy**
2. Click **Add CORS policy** and paste the JSON below:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://www.triptootravels.com",
      "https://admin.triptootravels.com"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

3. Save the policy.

## For development (allow all origins temporarily)

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

> ⚠️ Change `*` back to your actual domain list before going to production.

## How the upload flow works

```
Browser (Admin)
    │
    ├─ POST /api/proxy/upload/presign   ──► Backend (Node)
    │      { contentType, folder }           │
    │                                        ├─ Generates presigned PUT URL
    │                                        └─ Returns { uploadUrl, key, publicUrl }
    │
    ├─ PUT  uploadUrl  (direct to R2)   ──► Cloudflare R2
    │      File bytes in body                └─ Stores file at `key`
    │
    └─ Saves { url: publicUrl, public_id: key } in package JSON
           └─ POST/PUT /api/proxy/packages  ──► Backend saves to MongoDB
```

No file bytes ever pass through the Node backend — only tiny presign requests.
