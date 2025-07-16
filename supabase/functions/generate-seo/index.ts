import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { pageId, pageType, htmlContent, currentTitle } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Extract text content from HTML (remove HTML tags)
    const textContent = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 3000); // Limit to first 3000 characters

    const prompt = `
Elemezd az alábbi weboldalak tartalmát és generálj SEO-optimalizált meta adatokat magyar nyelven. 

Oldal címe: ${currentTitle}
Oldal tartalma: ${textContent}

A válaszod JSON formátumban legyen, pontosan az alábbi mezőkkel:
- meta_title: SEO-optimalizált címsor (max 60 karakter)
- meta_description: SEO leírás (150-160 karakter között)
- meta_keywords: Kulcsszavak vesszővel elválasztva (5-10 db)
- focus_keywords: Legfontosabb kulcsszavak tömbben JSON array formátumban (3-5 db)
- og_title: Open Graph címsor
- og_description: Open Graph leírás
- twitter_title: Twitter kártya címsor  
- twitter_description: Twitter kártya leírás

FONTOS: A focus_keywords mezőt MINDIG array formátumban add meg!

Példa válasz:
{
  "meta_title": "Email Marketing - Hírlevélküldés | Hirleveles.hu",
  "meta_description": "Professzionális email marketing szolgáltatások. Növeld bevételeid hírlevél kampányokkal. Kosárelhagyó automata, feliratkozó gyűjtés és több.",
  "meta_keywords": "email marketing, hírlevél, kosárelhagyó, automatizálás, hirdetés",
  "focus_keywords": ["email marketing", "hírlevél", "kosárelhagyó"],
  "og_title": "Email Marketing - Hírlevélküldés | Hirleveles.hu",
  "og_description": "Professzionális email marketing szolgáltatások. Növeld bevételeid hírlevél kampányokkal.",
  "twitter_title": "Email Marketing - Hírlevélküldés",
  "twitter_description": "Professzionális email marketing szolgáltatások és automatizálás."
}

Válaszolj csak JSON-nal, más szöveget ne írj:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Te egy SEO szakértő vagy, aki magyar nyelvű weboldalakhoz generálsz optimalizált meta adatokat. Mindig JSON formátumban válaszolj.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const aiData = await response.json();
    const generatedText = aiData.choices[0].message.content;
    
    // Parse the JSON response
    let seoData;
    try {
      // Clean the response - remove any markdown formatting
      const cleanedResponse = generatedText.replace(/```json\n?|```\n?/g, '').trim();
      seoData = JSON.parse(cleanedResponse);
      
      // Ensure focus_keywords is an array
      if (typeof seoData.focus_keywords === 'string') {
        seoData.focus_keywords = seoData.focus_keywords.split(',').map(k => k.trim());
      }
      
      console.log('Parsed SEO data:', seoData);
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedText);
      console.error('Parse error:', parseError);
      throw new Error(`Invalid AI response format: ${parseError.message}`);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save or update SEO settings
    const { data: existingSeo } = await supabase
      .from('page_seo_settings')
      .select('id')
      .eq('page_id', pageId)
      .eq('page_type', pageType)
      .maybeSingle();

    if (existingSeo) {
      // Update existing SEO settings
      await supabase
        .from('page_seo_settings')
        .update({
          meta_title: seoData.meta_title,
          meta_description: seoData.meta_description,
          meta_keywords: seoData.meta_keywords,
          focus_keywords: seoData.focus_keywords,
          og_title: seoData.og_title,
          og_description: seoData.og_description,
          twitter_title: seoData.twitter_title,
          twitter_description: seoData.twitter_description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSeo.id);
    } else {
      // Create new SEO settings
      await supabase
        .from('page_seo_settings')
        .insert({
          page_id: pageId,
          page_type: pageType,
          meta_title: seoData.meta_title,
          meta_description: seoData.meta_description,
          meta_keywords: seoData.meta_keywords,
          focus_keywords: seoData.focus_keywords,
          og_title: seoData.og_title,
          og_description: seoData.og_description,
          twitter_title: seoData.twitter_title,
          twitter_description: seoData.twitter_description,
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      seoData: seoData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-seo function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});