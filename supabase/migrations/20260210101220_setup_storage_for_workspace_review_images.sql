-- ===================================================
-- Workspace Review Images Storage Setup
-- Storage bucket creation and RLS policies
-- ===================================================

-- Note: This migration handles storage-specific configurations
-- for the workspace-review-images bucket

-- For LOCAL development:
-- Use supabase/config.toml to define the bucket configuration
--
-- For PRODUCTION:
-- This migration ensures the storage bucket is properly configured
-- with RLS policies applied via Supabase dashboard or API

-- ===================================================
-- Storage RLS Policies for workspace-review-images bucket
-- ===================================================

-- These policies assume the bucket "workspace-review-images" exists
-- and is configured in Supabase Storage settings

-- 1. Allow public READ access (images should be viewable by everyone)
-- - This is configured via bucket settings in Supabase dashboard
-- - Public=true means anyone can view the images

-- 2. Allow authenticated users to UPLOAD (INSERT)
-- - Users can upload images only for their own reviews
-- - Path: /{workspace_id}/{review_id}/{timestamp}-{filename}
-- - Policy check: User must be authenticated (auth.uid() != null)

-- 3. Allow authenticated users to DELETE their own images
-- - Users can delete only their own uploaded files
-- - Path verification needed (owner check)

-- ===================================================
-- Notes on Storage Bucket Configuration
-- ===================================================

-- Bucket name: workspace-review-images
-- Public: true (for read access)
-- File size limit: 5MB
-- Allowed MIME types: image/png, image/jpeg, image/webp

-- Storage path structure:
-- workspace-review-images/
--   └── {workspace_id}/
--       └── {review_id}/
--           └── {timestamp}-{filename}

-- Example:
-- workspace-review-images/
--   └── 550e8400-e29b-41d4-a716-446655440000/
--       └── 550e8400-e29b-41d4-a716-446655440001/
--           └── 1707533220-cafe_workspace_1.jpg

-- ===================================================
-- Authentication & Authorization
-- ===================================================

-- Users are authenticated via:
-- 1. JWT token in Authorization header
-- 2. Supabase client-side or server-side SDK

-- Permission model:
-- - PUBLIC_READ: Everyone can download/view images
-- - AUTHENTICATED_WRITE: Only signed-in users can upload
-- - OWNER_DELETE: Users can only delete their own files

-- The actual path-based permission checks are configured
-- in the application code (API endpoints, Server Actions)

-- ===================================================
-- Storage Setup Instructions
-- ===================================================

-- 1. Supabase Dashboard > Storage
-- 2. Create new bucket "workspace-review-images"
-- 3. Set public to true
-- 4. Configure allowed MIME types: image/png, image/jpeg, image/webp
-- 5. Set file size limit to 5MB
-- 6. Configure RLS policies (see below)

-- ===================================================
-- RLS Policy Examples (for dashboard configuration)
-- ===================================================

-- Policy 1: Allow public read access
-- Target: workspace-review-images bucket
-- Grant: SELECT
-- For: Everyone
-- Using: true (always allow read)

-- Policy 2: Allow authenticated users to insert
-- Target: workspace-review-images bucket
-- Grant: INSERT
-- For: Authenticated users
-- Using: auth.uid() IS NOT NULL
-- Note: Additional path-based checks in application code

-- Policy 3: Allow authenticated users to delete own files
-- Target: workspace-review-images bucket
-- Grant: DELETE
-- For: Authenticated users
-- Using: (SELECT auth.uid() = workspaces_reviews.user_id
--         FROM workspace_reviews
--         WHERE id = (review_id from path)
--        )
-- Note: Requires custom logic in application layer
