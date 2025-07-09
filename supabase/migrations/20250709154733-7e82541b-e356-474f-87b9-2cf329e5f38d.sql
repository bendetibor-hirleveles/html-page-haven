-- Add is_homepage column to static_pages table
ALTER TABLE public.static_pages 
ADD COLUMN is_homepage BOOLEAN DEFAULT false;

-- Create a function to ensure only one page can be homepage
CREATE OR REPLACE FUNCTION public.ensure_single_homepage()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a page as homepage, unset all other pages
  IF NEW.is_homepage = true THEN
    UPDATE public.static_pages 
    SET is_homepage = false 
    WHERE id != NEW.id AND is_homepage = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain single homepage
CREATE TRIGGER ensure_single_homepage_trigger
  BEFORE INSERT OR UPDATE ON public.static_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_homepage();