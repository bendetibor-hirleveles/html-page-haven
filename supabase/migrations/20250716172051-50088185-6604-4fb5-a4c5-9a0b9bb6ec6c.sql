-- Update HTML content in static_pages to replace old file names with new ones
UPDATE static_pages 
SET html_content = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(html_content, 
                        'hirleveles_logo_adsba másolat.png', 
                        'feher_hirleveles_logo__350.png'
                    ),
                    'hirleveles_logo_adsba%20másolat.png', 
                    'feher_hirleveles_logo__350.png'
                ),
                'hirleveles_logo_adsba%20m%C3%A1solat.png', 
                'feher_hirleveles_logo__350.png'
            ),
            'N%C3%A9vtelen%20terv%20(10).png', 
            'avatar2.jpg'
        ),
        'N%C3%A9vtelen%20terv%20(8).webp', 
        'avatar4.jpg'
    ),
    'Névtelen terv (10).png', 
    'avatar2.jpg'
),
updated_at = NOW()
WHERE html_content LIKE '%hirleveles_logo_adsba%' 
   OR html_content LIKE '%Névtelen terv%'
   OR html_content LIKE '%N%C3%A9vtelen%';

-- Update HTML content in blog_posts to replace old file names with new ones
UPDATE blog_posts 
SET html_content = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(html_content, 
                        'hirleveles_logo_adsba másolat.png', 
                        'feher_hirleveles_logo__350.png'
                    ),
                    'hirleveles_logo_adsba%20másolat.png', 
                    'feher_hirleveles_logo__350.png'
                ),
                'hirleveles_logo_adsba%20m%C3%A1solat.png', 
                'feher_hirleveles_logo__350.png'
            ),
            'N%C3%A9vtelen%20terv%20(10).png', 
            'avatar2.jpg'
        ),
        'N%C3%A9vtelen%20terv%20(8).webp', 
        'avatar4.jpg'
    ),
    'Névtelen terv (10).png', 
    'avatar2.jpg'
),
updated_at = NOW()
WHERE html_content LIKE '%hirleveles_logo_adsba%' 
   OR html_content LIKE '%Névtelen terv%'
   OR html_content LIKE '%N%C3%A9vtelen%';