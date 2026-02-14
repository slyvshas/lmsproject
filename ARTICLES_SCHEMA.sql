-- ============================================================================
-- ARTICLES DATABASE SCHEMA
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to create the articles table
-- and supporting infrastructure.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ARTICLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content Fields
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    
    -- Organization
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    
    -- Status & Publishing
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    
    -- Author Relationship
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Statistics
    views INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_author ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_articles_search ON public.articles 
USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-SET PUBLISHED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set published_at when status changes to 'published'
    IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published' OR OLD.published_at IS NULL) THEN
        NEW.published_at = COALESCE(NEW.published_at, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_articles_published_at ON public.articles;
CREATE TRIGGER trigger_articles_published_at
    BEFORE INSERT OR UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION set_published_at();

-- ============================================================================
-- INCREMENT VIEWS FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.articles 
    SET views = views + 1 
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published articles
CREATE POLICY "Public can view published articles" 
ON public.articles 
FOR SELECT 
USING (status = 'published');

-- Policy: Authenticated users can view their own articles (any status)
CREATE POLICY "Authors can view own articles" 
ON public.articles 
FOR SELECT 
TO authenticated 
USING (author_id = auth.uid());

-- Policy: Admins can view all articles
CREATE POLICY "Admins can view all articles" 
ON public.articles 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Admins can insert articles
CREATE POLICY "Admins can create articles" 
ON public.articles 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Admins can update articles
CREATE POLICY "Admins can update articles" 
ON public.articles 
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Admins can delete articles
CREATE POLICY "Admins can delete articles" 
ON public.articles 
FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - Comment out in production)
-- ============================================================================
-- INSERT INTO public.articles (title, slug, content, excerpt, category, tags, status, author_id)
-- VALUES 
-- (
--     'Getting Started with Online Learning',
--     'getting-started-with-online-learning',
--     '<h2>Welcome to Online Learning</h2><p>Online learning has revolutionized education, making it accessible to everyone, everywhere. In this guide, we''ll explore the best practices for succeeding in your online courses.</p><h3>1. Create a Dedicated Study Space</h3><p>Having a consistent, distraction-free environment is crucial for effective learning. Choose a quiet spot with good lighting and minimal interruptions.</p><h3>2. Set a Schedule</h3><p>Treat your online courses like traditional classes. Set specific times for studying and stick to them. Consistency is key!</p><h3>3. Engage Actively</h3><p>Don''t just passively watch videos. Take notes, participate in discussions, and apply what you learn.</p><blockquote>The beautiful thing about learning is that nobody can take it away from you. - B.B. King</blockquote><p>Start your learning journey today!</p>',
--     'Discover the best practices for succeeding in online courses and maximizing your learning potential.',
--     'Learning Tips',
--     ARRAY['education', 'online-learning', 'tips'],
--     'published',
--     NULL -- Replace with an actual admin user ID
-- ),
-- (
--     'Top 10 Programming Languages to Learn in 2024',
--     'top-programming-languages-2024',
--     '<h2>Programming Languages Shaping the Future</h2><p>Choosing the right programming language to learn can be overwhelming. Here are the top 10 languages that will be most valuable in 2024.</p><h3>1. Python</h3><p>Python continues to dominate in AI, machine learning, data science, and web development.</p><h3>2. JavaScript</h3><p>Essential for web development and increasingly used in backend and mobile development.</p><h3>3. TypeScript</h3><p>Adding type safety to JavaScript, TypeScript is becoming the standard for large-scale applications.</p><p>Continue exploring to find the perfect language for your career goals!</p>',
--     'Explore the most in-demand programming languages and find the right one for your career.',
--     'Technology',
--     ARRAY['programming', 'career', 'technology'],
--     'published',
--     NULL -- Replace with an actual admin user ID
-- );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.articles TO anon;
GRANT ALL ON public.articles TO authenticated;
GRANT EXECUTE ON FUNCTION increment_article_views(UUID) TO anon, authenticated;

-- ============================================================================
-- VERIFY INSTALLATION
-- ============================================================================
-- Run this query to verify the table was created correctly:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'articles';
