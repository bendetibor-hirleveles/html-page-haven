-- Create global SEO settings table
CREATE TABLE public.global_seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_title TEXT,
  site_description TEXT,
  site_keywords TEXT,
  canonical_domain TEXT,
  google_analytics_id TEXT,
  google_tag_manager_id TEXT,
  google_search_console_id TEXT,
  facebook_pixel_id TEXT,
  tiktok_pixel_id TEXT,
  custom_head_scripts TEXT,
  custom_body_scripts TEXT,
  schema_markup JSONB,
  open_graph_image TEXT,
  robots_txt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page-specific SEO settings table
CREATE TABLE public.page_seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type TEXT NOT NULL CHECK (page_type IN ('static', 'blog')),
  page_id UUID NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  schema_markup JSONB,
  custom_head_scripts TEXT,
  custom_body_scripts TEXT,
  focus_keywords TEXT[], -- Array of focus keywords
  seo_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create keywords tracking table
CREATE TABLE public.keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  difficulty INTEGER,
  cpc DECIMAL(10,2),
  trend_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page keywords relationship table
CREATE TABLE public.page_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type TEXT NOT NULL CHECK (page_type IN ('static', 'blog')),
  page_id UUID NOT NULL,
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  position INTEGER, -- Current ranking position
  density DECIMAL(5,2), -- Keyword density in content
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.global_seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_keywords ENABLE ROW LEVEL SECURITY;

-- Create policies for global SEO settings
CREATE POLICY "Allow all operations on global SEO settings" 
ON public.global_seo_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create policies for page SEO settings
CREATE POLICY "Allow all operations on page SEO settings" 
ON public.page_seo_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create policies for keywords
CREATE POLICY "Allow all operations on keywords" 
ON public.keywords 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create policies for page keywords
CREATE POLICY "Allow all operations on page keywords" 
ON public.page_keywords 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_global_seo_settings_updated_at
  BEFORE UPDATE ON public.global_seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_seo_settings_updated_at
  BEFORE UPDATE ON public.page_seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at
  BEFORE UPDATE ON public.keywords
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_keywords_updated_at
  BEFORE UPDATE ON public.page_keywords
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default global settings
INSERT INTO public.global_seo_settings (site_title, site_description, robots_txt) 
VALUES (
  'Your Website Title',
  'Your website description for search engines',
  'User-agent: *\nDisallow: /admin/\nSitemap: /sitemap.xml'
);