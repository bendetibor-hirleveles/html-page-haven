-- Add menu visibility setting to static_pages table
ALTER TABLE public.static_pages 
ADD COLUMN show_in_menu boolean DEFAULT true,
ADD COLUMN show_in_header boolean DEFAULT true;

-- Create redirects table for 301 redirects
CREATE TABLE public.redirects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_path text NOT NULL UNIQUE,
  to_path text NOT NULL,
  redirect_type integer NOT NULL DEFAULT 301,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on redirects table
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Create policies for redirects (admin only)
CREATE POLICY "Allow all operations on redirects" 
ON public.redirects 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_redirects_updated_at
BEFORE UPDATE ON public.redirects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample redirects that might exist
INSERT INTO public.redirects (from_path, to_path, redirect_type, is_active) VALUES
('/old-page.html', '/', 301, true),
('/old-about.html', '/about', 301, true),
('/contact.html', '/contact', 301, true);

-- Create index for faster lookups
CREATE INDEX idx_redirects_from_path ON public.redirects(from_path) WHERE is_active = true;