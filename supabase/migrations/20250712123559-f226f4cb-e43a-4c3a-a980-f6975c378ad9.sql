-- Update assets_zip_path for pages where we have matching asset files
UPDATE static_pages 
SET assets_zip_path = 'hirleveleshu-8211-az-email-marketing-ceg-email-marketing-hirlevel-szovegiras-megirjuk-a-penzt-assets.zip'
WHERE slug = 'index';

-- For other pages that should share the same assets, update them too
UPDATE static_pages 
SET assets_zip_path = 'hirleveleshu-8211-az-email-marketing-ceg-email-marketing-hirlevel-szovegiras-megirjuk-a-penzt-assets.zip'
WHERE assets_zip_path IS NULL;