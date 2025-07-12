import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { zipFileName } = await req.json()
    
    if (!zipFileName) {
      throw new Error('ZIP file name is required')
    }

    // Download the ZIP file from storage
    const { data: zipData, error: downloadError } = await supabaseClient.storage
      .from('assets')
      .download(zipFileName)

    if (downloadError) {
      throw new Error(`Failed to download ZIP: ${downloadError.message}`)
    }

    // Convert blob to buffer
    const zipBuffer = await zipData.arrayBuffer()
    
    // Use JSZip to extract files
    const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(zipBuffer)

    const extractedFiles = []
    const folderName = zipFileName.replace('.zip', '')

    // Extract each file
    for (const [fileName, file] of Object.entries(zipContent.files)) {
      if (!file.dir) {
        try {
          const fileContent = await file.async('uint8array')
          const storagePath = `${folderName}/${fileName}`
          
          // Upload to storage
          const { error: uploadError } = await supabaseClient.storage
            .from('assets')
            .upload(storagePath, fileContent, {
              contentType: getContentType(fileName),
              upsert: true
            })

          if (uploadError) {
            console.error(`Failed to upload ${fileName}:`, uploadError)
          } else {
            extractedFiles.push(storagePath)
          }
        } catch (error) {
          console.error(`Error processing ${fileName}:`, error)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        extractedFiles,
        message: `Extracted ${extractedFiles.length} files from ${zipFileName}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function getContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  
  const mimeTypes: Record<string, string> = {
    'css': 'text/css',
    'js': 'application/javascript',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'avif': 'image/avif',
    'svg': 'image/svg+xml',
    'gif': 'image/gif',
    'html': 'text/html',
    'txt': 'text/plain',
    'json': 'application/json',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'application/vnd.ms-fontobject'
  }
  
  return mimeTypes[ext || ''] || 'application/octet-stream'
}