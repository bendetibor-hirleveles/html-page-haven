import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get all files from storage buckets
    const buckets = ['static-pages', 'blog-posts', 'assets', 'static-assets'];
    const allFiles: { bucket: string; name: string; data: Uint8Array }[] = [];

    for (const bucket of buckets) {
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1000 });

      if (listError) {
        console.error(`Error listing files in ${bucket}:`, listError);
        continue;
      }

      for (const file of files || []) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(file.name);

        if (!error && data) {
          const bytes = new Uint8Array(await data.arrayBuffer());
          allFiles.push({
            bucket,
            name: file.name,
            data: bytes
          });
        }
      }
    }

    // Create a simple archive response
    const response = new Response(JSON.stringify({
      message: `Found ${allFiles.length} files`,
      files: allFiles.map(f => ({
        bucket: f.bucket,
        name: f.name,
        size: f.data.length
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    return response;

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});