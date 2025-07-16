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

    // Download the file from storage
    const { data, error } = await supabase.storage
      .from('assets')
      .download(path)

    if (error) {
      console.error('Storage error:', error)
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
    }

    // Return the file with proper headers
    return new Response(data, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
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