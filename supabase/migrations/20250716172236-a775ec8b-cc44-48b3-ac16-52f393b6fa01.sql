-- Update all asset paths from /assets/ to /common-assets/ in static_pages
UPDATE static_pages 
SET html_content = REPLACE(html_content, '/assets/', '/common-assets/'),
    updated_at = NOW()
WHERE html_content LIKE '%/assets/%';

-- Update all asset paths from /assets/ to /common-assets/ in blog_posts  
UPDATE blog_posts 
SET html_content = REPLACE(html_content, '/assets/', '/common-assets/'),
    updated_at = NOW()
WHERE html_content LIKE '%/assets/%';

-- Also update any remaining src="assets/ or href="assets/ references (without leading slash)
UPDATE static_pages 
SET html_content = REPLACE(
    REPLACE(html_content, 'src="assets/', 'src="/common-assets/'),
    'href="assets/', 'href="/common-assets/'
),
updated_at = NOW()
WHERE html_content LIKE '%src="assets/%' OR html_content LIKE '%href="assets/%';

UPDATE blog_posts 
SET html_content = REPLACE(
    REPLACE(html_content, 'src="assets/', 'src="/common-assets/'),
    'href="assets/', 'href="/common-assets/'
),
updated_at = NOW()
WHERE html_content LIKE '%src="assets/%' OR html_content LIKE '%href="assets/%';