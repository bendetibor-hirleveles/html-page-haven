import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/serve-assets/', '')
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Try to download from common-assets first, then fallback to original path
    let data, error;
    
    // First try common-assets folder
    const commonAssetsPath = path.replace(/^[^/]+-assets\//, 'common-assets/');
    ({ data, error } = await supabase.storage
      .from('assets')
      .download(commonAssetsPath));
    
    // If not found in common-assets, try the original path structure  
    if (error) {
      ({ data, error } = await supabase.storage
        .from('assets')
        .download(path));
    }

    if (error) {
      console.error('Storage error for path:', path, 'and common path:', commonAssetsPath, 'Error:', error)
      return new Response('File not found', { 
        status: 404,
        headers: corsHeaders 
      })
    }

    // Determine content type based on file extension
    let contentType = 'text/plain'
    if (path.endsWith('.css')) {
      contentType = 'text/css'
    } else if (path.endsWith('.js')) {
      contentType = 'application/javascript'
    } else if (path.endsWith('.png')) {
      contentType = 'image/png'
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      contentType = 'image/jpeg'
    } else if (path.endsWith('.gif')) {
      contentType = 'image/gif'
    } else if (path.endsWith('.svg')) {
      contentType = 'image/svg+xml'
    } else if (path.endsWith('.woff') || path.endsWith('.woff2')) {
      contentType = 'font/woff2'
    } else if (path.endsWith('.ttf')) {
      contentType = 'font/ttf'
    }

    // Return the file with proper headers including CORS and CORB prevention
    return new Response(data, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Credentials': 'false',
        'X-Content-Type-Options': 'nosniff',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})