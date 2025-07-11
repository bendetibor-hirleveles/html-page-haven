-- Create storage buckets for static pages and assets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('static-pages', 'static-pages', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for static pages storage
CREATE POLICY "Public Access Static Pages" ON storage.objects FOR SELECT USING (bucket_id = 'static-pages');
CREATE POLICY "Allow Upload Static Pages" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'static-pages');
CREATE POLICY "Allow Update Static Pages" ON storage.objects FOR UPDATE USING (bucket_id = 'static-pages');
CREATE POLICY "Allow Delete Static Pages" ON storage.objects FOR DELETE USING (bucket_id = 'static-pages');

-- Create policies for assets storage
CREATE POLICY "Public Access Assets" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Allow Upload Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets');
CREATE POLICY "Allow Update Assets" ON storage.objects FOR UPDATE USING (bucket_id = 'assets');
CREATE POLICY "Allow Delete Assets" ON storage.objects FOR DELETE USING (bucket_id = 'assets');