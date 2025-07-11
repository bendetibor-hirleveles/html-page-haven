-- Add menu and header visibility settings to blog posts
ALTER TABLE public.blog_posts 
ADD COLUMN show_in_menu boolean DEFAULT true,
ADD COLUMN show_in_header boolean DEFAULT true;