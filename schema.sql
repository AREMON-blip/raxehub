-- Idempotent migration — PRD.md §5. Vanguard runs this in Neon SQL Editor.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  status text NOT NULL DEFAULT 'released',
  type text NOT NULL DEFAULT 'apk',
  live_url text,
  repo_url text,
  stack text,
  icon_key text,
  preview_key text,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Existing databases: add PRD §5 / F9 columns without touching stored rows.
ALTER TABLE apps ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'apk';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS live_url text;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS repo_url text;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS stack text;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS icon_key text;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS preview_key text;

CREATE TABLE IF NOT EXISTS versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  version_name text NOT NULL,
  version_code int NOT NULL,
  release_notes text,
  apk_key text NOT NULL,
  size_bytes bigint NOT NULL,
  sha256 text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  r2_key text NOT NULL,
  caption text,
  sort int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_versions_app_active ON versions(app_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_screenshots_app ON screenshots(app_id, sort);
