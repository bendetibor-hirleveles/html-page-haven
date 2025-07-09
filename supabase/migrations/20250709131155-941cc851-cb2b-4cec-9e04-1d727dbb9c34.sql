-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('static-pages', 'static-pages', true),
  ('blog-posts', 'blog-posts', true),
  ('assets', 'assets', true);

-- Create table for static pages
CREATE TABLE public.static_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  html_content TEXT NOT NULL,
  html_file_path TEXT,
  assets_zip_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for blog posts
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  html_content TEXT NOT NULL,
  html_file_path TEXT,
  assets_zip_path TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public website)
CREATE POLICY "Public can view static pages" 
ON public.static_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Public can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (published = true);

-- Create storage policies for public access
CREATE POLICY "Public can view static page files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'static-pages');

CREATE POLICY "Public can view blog post files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blog-posts');

CREATE POLICY "Public can view assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'assets');

-- Admin policies (you can add authentication later)
CREATE POLICY "Allow all operations on static pages" 
ON public.static_pages 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on blog posts" 
ON public.blog_posts 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on static page files" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'static-pages')
WITH CHECK (bucket_id = 'static-pages');

CREATE POLICY "Allow all operations on blog post files" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'blog-posts')
WITH CHECK (bucket_id = 'blog-posts');

CREATE POLICY "Allow all operations on assets" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'assets')
WITH CHECK (bucket_id = 'assets');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_static_pages_updated_at
  BEFORE UPDATE ON public.static_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();