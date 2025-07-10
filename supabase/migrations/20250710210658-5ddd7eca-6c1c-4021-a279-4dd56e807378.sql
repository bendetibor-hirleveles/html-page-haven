-- Create storage bucket for static assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('static-assets', 'static-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for static assets storage
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'static-assets');
CREATE POLICY "Allow Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'static-assets');
CREATE POLICY "Allow Update" ON storage.objects FOR UPDATE USING (bucket_id = 'static-assets');
CREATE POLICY "Allow Delete" ON storage.objects FOR DELETE USING (bucket_id = 'static-assets');