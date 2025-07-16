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

  // Helper function to determine content type
  const getContentType = (filePath: string) => {
    if (filePath.endsWith('.css')) return 'text/css'
    if (filePath.endsWith('.js')) return 'application/javascript'
    if (filePath.endsWith('.png')) return 'image/png'
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg'
    if (filePath.endsWith('.gif')) return 'image/gif'
    if (filePath.endsWith('.svg')) return 'image/svg+xml'
    if (filePath.endsWith('.webp')) return 'image/webp'
    // Font files
    if (filePath.endsWith('.woff2')) return 'font/woff2'
    if (filePath.endsWith('.woff')) return 'font/woff'
    if (filePath.endsWith('.ttf')) return 'font/ttf'
    if (filePath.endsWith('.otf')) return 'font/otf'
    if (filePath.endsWith('.eot')) return 'application/vnd.ms-fontobject'
    return 'text/plain'
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/serve-assets/', '')
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Optimize path resolution - prefer common-assets
    const commonAssetsPath = path.replace(/^[^/]+-assets\//, 'common-assets/');
    const targetPath = path.includes('common-assets/') ? path : commonAssetsPath;
    
    // Single storage query
    const { data, error } = await supabase.storage
      .from('assets')
      .download(targetPath);
    
    // Only try fallback if not already trying common-assets
    if (error && targetPath !== path) {
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from('assets')
        .download(path);
      
      if (!fallbackError) {
        return new Response(fallbackData, {
          headers: {
            ...corsHeaders,
            'Content-Type': getContentType(path),
            'Cache-Control': 'public, max-age=86400', // 24 hours
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Credentials': 'false',
            'X-Content-Type-Options': 'nosniff',
            'Cross-Origin-Resource-Policy': 'cross-origin'
          }
        });
      }
    }

    if (error) {
      console.error('Storage error for path:', path, 'and common path:', commonAssetsPath, 'Error:', error)
      return new Response('File not found', { 
        status: 404,
        headers: corsHeaders 
      })
    }


    // Return the file with optimized headers
    return new Response(data, {
      headers: {
        ...corsHeaders,
        'Content-Type': getContentType(path),
        'Cache-Control': 'public, max-age=86400', // 24 hours
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