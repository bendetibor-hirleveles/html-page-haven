-- Add tags support to blog posts
ALTER TABLE public.blog_posts ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for tags array for better performance
CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING GIN(tags);