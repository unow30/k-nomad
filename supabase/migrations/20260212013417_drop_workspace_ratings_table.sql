-- Drop workspace_ratings table and related objects
-- This table is no longer needed as ratings are handled within reviews

-- Drop triggers first (if they exist)
DROP TRIGGER IF EXISTS update_workspace_rating_on_rating_change ON workspace_ratings;
DROP TRIGGER IF EXISTS update_workspace_rating_stats ON workspace_ratings;

-- Drop functions (CASCADE to remove dependent triggers)
DROP FUNCTION IF EXISTS update_workspace_rating_stats() CASCADE;

-- Drop table (cascade will also drop foreign keys and indexes)
DROP TABLE IF EXISTS workspace_ratings CASCADE;
