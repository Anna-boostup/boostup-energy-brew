-- RLS Policies for Blog Categories
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Allow Public to view categories
DROP POLICY IF EXISTS "Public read categories" ON blog_categories;
CREATE POLICY "Public read categories" ON blog_categories FOR SELECT USING (true);

-- Allow Admin to manage categories
DROP POLICY IF EXISTS "Admin manage categories" ON blog_categories;
CREATE POLICY "Admin manage categories" ON blog_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Fix Blog Posts Schema (Add missing columns if they don't exist)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content_html TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Ensure columns are nullable to avoid "violates not-null constraint"
ALTER TABLE blog_posts ALTER COLUMN content DROP NOT NULL;
ALTER TABLE blog_posts ALTER COLUMN content_html DROP NOT NULL;
ALTER TABLE blog_posts ALTER COLUMN excerpt DROP NOT NULL;
ALTER TABLE blog_posts ALTER COLUMN featured_image_url DROP NOT NULL;
ALTER TABLE blog_posts ALTER COLUMN status DROP NOT NULL;

-- RLS Policies for Blog Posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow Public to view ONLY published posts
DROP POLICY IF EXISTS "Public view published posts" ON blog_posts;
CREATE POLICY "Public view published posts" ON blog_posts FOR SELECT USING (
  status = 'published' OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allow Admin to manage all posts
DROP POLICY IF EXISTS "Admin manage posts" ON blog_posts;
CREATE POLICY "Admin manage posts" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
