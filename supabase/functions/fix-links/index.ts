import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting link fix process...');

    // Fix static pages
    const { data: staticPages, error: staticError } = await supabase
      .from('static_pages')
      .select('id, title, html_content')
      .like('html_content', '%comtact%');

    if (staticError) throw staticError;

    let fixedStatic = 0;
    for (const page of staticPages || []) {
      const fixedHtml = page.html_content.replace(/comtact/g, 'contact');
      await supabase
        .from('static_pages')
        .update({ html_content: fixedHtml })
        .eq('id', page.id);
      
      console.log(`Fixed static page: ${page.title}`);
      fixedStatic++;
    }

    // Fix blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('id, title, html_content')
      .like('html_content', '%comtact%');

    if (blogError) throw blogError;

    let fixedBlog = 0;
    for (const post of blogPosts || []) {
      const fixedHtml = post.html_content.replace(/comtact/g, 'contact');
      await supabase
        .from('blog_posts')
        .update({ html_content: fixedHtml })
        .eq('id', post.id);
      
      console.log(`Fixed blog post: ${post.title}`);
      fixedBlog++;
    }

    console.log(`Link fix completed. Fixed ${fixedStatic} static pages and ${fixedBlog} blog posts.`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Link fix completed successfully`,
      fixedStatic,
      fixedBlog
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fix-links function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});