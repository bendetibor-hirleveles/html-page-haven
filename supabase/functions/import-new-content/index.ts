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

    const { htmlFiles } = await req.json();

    if (!htmlFiles || !Array.isArray(htmlFiles)) {
      throw new Error('HTML files array is required');
    }

    console.log(`Starting import of ${htmlFiles.length} HTML files...`);

    const results = [];

    for (const fileData of htmlFiles) {
      const { fileName, htmlContent } = fileData;
      
      if (!fileName || !htmlContent) {
        console.warn('Skipping file with missing fileName or htmlContent');
        continue;
      }

      // Generálunk slug-ot a fájlnévből
      const slug = fileName
        .replace(/\.html$/i, '') // HTML kiterjesztés eltávolítása
        .toLowerCase()
        .replace(/[áéíóöőúüű]/g, (char) => { // Ékezetek eltávolítása
          const map: { [key: string]: string } = {
            'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o',
            'ú': 'u', 'ü': 'u', 'ű': 'u'
          };
          return map[char] || char;
        })
        .replace(/[^a-z0-9\-]/g, '-') // Nem engedélyezett karakterek cseréje kötőjelre
        .replace(/-+/g, '-') // Többszörös kötőjelek egybe vonása
        .replace(/^-|-$/g, ''); // Elején és végén lévő kötőjelek eltávolítása

      // Kinyerjük a címet a HTML-ből
      let title = '';
      
      // Próbáljuk meg kinyerni a title tag-ből
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else {
        // Ha nincs title tag, próbáljuk meg az első h1-ből
        const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match) {
          title = h1Match[1].trim();
        } else {
          // Ha semmi sem található, használjuk a fájlnevet
          title = fileName.replace(/\.html$/i, '').replace(/[-_]/g, ' ');
        }
      }

      // Ellenőrizzük, hogy létezik-e már ilyen slug
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingPost) {
        console.log(`Skipping ${fileName} - slug '${slug}' already exists`);
        results.push({
          fileName,
          slug,
          status: 'skipped',
          reason: 'Slug already exists'
        });
        continue;
      }

      // Beszúrjuk az új blogposztot
      const { data: newPost, error: insertError } = await supabase
        .from('blog_posts')
        .insert({
          title,
          slug,
          html_content: htmlContent,
          published: false, // Alapértelmezetten nem publikált
          show_in_menu: true,
          show_in_header: false
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(`Error inserting ${fileName}:`, insertError);
        results.push({
          fileName,
          slug,
          status: 'error',
          error: insertError.message
        });
        continue;
      }

      console.log(`Successfully imported ${fileName} as '${slug}'`);
      results.push({
        fileName,
        slug,
        title,
        status: 'imported',
        id: newPost.id
      });
    }

    const successful = results.filter(r => r.status === 'imported').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`Import completed: ${successful} imported, ${skipped} skipped, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Import completed: ${successful} imported, ${skipped} skipped, ${errors} errors`,
        results,
        summary: {
          imported: successful,
          skipped,
          errors
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Import error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})