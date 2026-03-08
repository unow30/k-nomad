-- Add has_images column to workspace_reviews table (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspace_reviews' AND column_name = 'has_images'
  ) THEN
    ALTER TABLE workspace_reviews ADD COLUMN has_images BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index for has_images column (optional but useful for filtering)
CREATE INDEX IF NOT EXISTS idx_workspace_reviews_has_images ON workspace_reviews(has_images);

-- Update existing reviews that have images
UPDATE workspace_reviews wr
SET has_images = TRUE
WHERE EXISTS (
  SELECT 1
  FROM workspace_review_images wri
  WHERE wri.review_id = wr.id
);

-- Create trigger to automatically update has_images when images are added/removed
CREATE OR REPLACE FUNCTION update_workspace_review_has_images()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- When an image is inserted, set has_images to true
    UPDATE workspace_reviews
    SET has_images = TRUE
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- When an image is deleted, check if there are any remaining images
    UPDATE workspace_reviews
    SET has_images = (
      EXISTS (
        SELECT 1
        FROM workspace_review_images
        WHERE review_id = OLD.review_id
      )
    )
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_review_has_images_on_image_change ON workspace_review_images;

CREATE TRIGGER update_review_has_images_on_image_change
AFTER INSERT OR DELETE ON workspace_review_images
FOR EACH ROW
EXECUTE FUNCTION update_workspace_review_has_images();
