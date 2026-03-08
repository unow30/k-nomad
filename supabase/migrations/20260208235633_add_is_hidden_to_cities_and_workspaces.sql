-- Add is_hidden column to cities table
ALTER TABLE cities
ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE NOT NULL;

-- Add is_hidden column to workspaces table
ALTER TABLE workspaces
ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for filtering hidden cities
CREATE INDEX idx_cities_is_hidden ON cities(is_hidden);

-- Add index for filtering hidden workspaces
CREATE INDEX idx_workspaces_is_hidden ON workspaces(is_hidden);

-- Add comment
COMMENT ON COLUMN cities.is_hidden IS '관리자가 도시를 숨김 처리한 경우 true. 삭제 대신 사용.';
COMMENT ON COLUMN workspaces.is_hidden IS '관리자가 작업공간을 숨김 처리한 경우 true. 삭제 대신 사용.';
