# Avatar Upload Feature

## Overview
Allow users to upload and display avatar images on their profile page. Supports JPEG, PNG, and WebP formats with a 5MB size limit.

## Files to Change
- `backend/main.py` — Add `POST /api/users/avatar/upload` endpoint for uploading avatars
- `backend/schemas.py` — Add `AvatarUploadResponse` schema
- `frontend/src/pages/ProfilePage.tsx` — Add avatar upload component with preview
- `frontend/src/components/AvatarUploader.tsx` — New component for drag-and-drop upload
- `frontend/src/api/users.ts` — Add `uploadAvatar` API method
- `docs/plans/test-avatar-upload.md` — This plan file

## API Changes
- `POST /api/users/avatar/upload` — Upload user avatar (multipart/form-data)
  - Returns: `{ "url": "/avatars/{user_id}.jpg" }`
  - Validates: file type (JPEG/PNG/WebP), size ≤ 5MB

## Tests
- Backend: Test file validation, size limits, response format
- Frontend: Test drag-and-drop upload, preview, error states

## Risks / Considerations
- Storage: avatars stored locally on disk under `/avatars/`
- Security: validate MIME type on server side, not just file extension
- Caching: add cache-busting query param to avatar URLs
