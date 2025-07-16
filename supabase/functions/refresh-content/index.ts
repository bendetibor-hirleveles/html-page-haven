import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting content refresh process...');

    // 1. Frissíti az összes /assets/ hivatkozást /common-assets/-ra
    console.log('Step 1: Updating asset paths...');
    
    // Get all static pages that need asset path updates
    const { data: staticPagesAssets, error: staticPagesAssetsError } = await supabase
      .from('static_pages')
      .select('id, html_content')
      .or('html_content.like.%/assets/%,html_content.like.%src="assets/%,html_content.like.%href="assets/%');

    if (staticPagesAssetsError) {
      throw staticPagesAssetsError;
    }

    for (const page of staticPagesAssets || []) {
      let updatedContent = page.html_content;
      updatedContent = updatedContent.replace(/\/assets\//g, '/common-assets/');
      updatedContent = updatedContent.replace(/src="assets\//g, 'src="/common-assets/');
      updatedContent = updatedContent.replace(/href="assets\//g, 'href="/common-assets/');

      const { error: updateError } = await supabase
        .from('static_pages')
        .update({
          html_content: updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);

      if (updateError) {
        throw updateError;
      }
    }

    // Do the same for blog posts
    const { data: blogPostsAssets, error: blogPostsAssetsError } = await supabase
      .from('blog_posts')
      .select('id, html_content')
      .or('html_content.like.%/assets/%,html_content.like.%src="assets/%,html_content.like.%href="assets/%');

    if (blogPostsAssetsError) {
      throw blogPostsAssetsError;
    }

    for (const post of blogPostsAssets || []) {
      let updatedContent = post.html_content;
      updatedContent = updatedContent.replace(/\/assets\//g, '/common-assets/');
      updatedContent = updatedContent.replace(/src="assets\//g, 'src="/common-assets/');
      updatedContent = updatedContent.replace(/href="assets\//g, 'href="/common-assets/');

      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          html_content: updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (updateError) {
        throw updateError;
      }
    }

    // 2. Frissíti a hiányzó fájlneveket
    console.log('Step 2: Updating file names...');
    
    // Get all pages that need updating
    const { data: staticPages, error: staticPagesError } = await supabase
      .from('static_pages')
      .select('id, html_content')
      .or('html_content.like.%hirleveles_logo_adsba%,html_content.like.%Névtelen terv%,html_content.like.%N%C3%A9vtelen%');

    if (staticPagesError) {
      console.error('Static pages error:', staticPagesError);
      throw staticPagesError;
    }

    // Update each page
    for (const page of staticPages || []) {
      let updatedContent = page.html_content;
      
      // Replace all problematic file names
      updatedContent = updatedContent.replace(/hirleveles_logo_adsba másolat\.png/g, 'feher_hirleveles_logo__350.png');
      updatedContent = updatedContent.replace(/hirleveles_logo_adsba%20másolat\.png/g, 'feher_hirleveles_logo__350.png');
      updatedContent = updatedContent.replace(/hirleveles_logo_adsba%20m%C3%A1solat\.png/g, 'feher_hirleveles_logo__350.png');
      updatedContent = updatedContent.replace(/N%C3%A9vtelen%20terv%20\(10\)\.png/g, 'avatar2.jpg');
      updatedContent = updatedContent.replace(/N%C3%A9vtelen%20terv%20\(8\)\.webp/g, 'avatar4.jpg');
      updatedContent = updatedContent.replace(/Névtelen terv \(10\)\.png/g, 'avatar2.jpg');
      updatedContent = updatedContent.replace(/Névtelen terv \(8\)\.webp/g, 'avatar4.jpg');

      // Add cache busting timestamps
      const timestamp = Date.now();
      updatedContent = updatedContent.replace(/href="([^"]+\.css)"/g, `href="$1?v=${timestamp}"`);
      updatedContent = updatedContent.replace(/src="([^"]+\.js)"/g, `src="$1?v=${timestamp}"`);

      const { error: updateError } = await supabase
        .from('static_pages')
        .update({
          html_content: updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);

      if (updateError) {
        console.error('Update error for page:', page.id, updateError);
        throw updateError;
      }
    }

    // Do the same for blog posts
    const { data: blogPosts, error: blogPostsError } = await supabase
      .from('blog_posts')
      .select('id, html_content')
      .or('html_content.like.%hirleveles_logo_adsba%,html_content.like.%Névtelen terv%,html_content.like.%N%C3%A9vtelen%');

    if (blogPostsError) {
      console.error('Blog posts error:', blogPostsError);
      throw blogPostsError;
    }

    for (const post of blogPosts || []) {
      let updatedContent = post.html_content;
      
      // Replace all problematic file names
      updatedContent = updatedContent.replace(/hirleveles_logo_adsba másolat\.png/g, 'feher_hirleveles_logo__350.png');
      updatedContent = updatedContent.replace(/hirleveles_logo_adsba%20másolat\.png/g, 'feher_hirleveles_logo__350.png');
      updatedContent = updatedContent.replace(/hirleveles_logo_adsba%20m%C3%A1solat\.png/g, 'feher_hirleveles_logo__350.png');
      updatedContent = updatedContent.replace(/N%C3%A9vtelen%20terv%20\(10\)\.png/g, 'avatar2.jpg');
      updatedContent = updatedContent.replace(/N%C3%A9vtelen%20terv%20\(8\)\.webp/g, 'avatar4.jpg');
      updatedContent = updatedContent.replace(/Névtelen terv \(10\)\.png/g, 'avatar2.jpg');
      updatedContent = updatedContent.replace(/Névtelen terv \(8\)\.webp/g, 'avatar4.jpg');

      // Add cache busting timestamps
      const timestamp = Date.now();
      updatedContent = updatedContent.replace(/href="([^"]+\.css)"/g, `href="$1?v=${timestamp}"`);
      updatedContent = updatedContent.replace(/src="([^"]+\.js)"/g, `src="$1?v=${timestamp}"`);

      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          html_content: updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (updateError) {
        console.error('Update error for post:', post.id, updateError);
        throw updateError;
      }
    }

    console.log('Content refresh completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'All content refreshed successfully',
        timestamp: new Date().toISOString(),
        updated: {
          static_pages: (staticPagesAssets?.length || 0) + (staticPages?.length || 0),
          blog_posts: (blogPostsAssets?.length || 0) + (blogPosts?.length || 0)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Content refresh error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})