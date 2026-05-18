CREATE TABLE IF NOT EXISTS cms_content (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  status TEXT DEFAULT 'published',
  payload TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS cms_content_type_status_idx
ON cms_content (type, status);
