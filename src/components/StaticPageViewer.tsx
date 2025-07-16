import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CookieConsent } from "@/components/CookieConsent";
import { Loader } from "lucide-react";

interface PageContent {
  id: string;
  title: string;
  slug: string;
  html_content: string;
  assets_zip_path: string | null;
  created_at: string;
  updated_at: string;
  // Optional fields that may differ between static_pages and blog_posts
  html_file_path?: string | null;
  is_homepage?: boolean;
  show_in_menu?: boolean;
  show_in_header?: boolean;
  published?: boolean;
}

export function StaticPageViewer() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageContent | null>(null);
  const [processedHtml, setProcessedHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;

      try {
        // Try static_pages first
        let { data, error } = await supabase
          .from("static_pages")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        // If not found in static_pages, try blog_posts
        if (!data && !error) {
          const { data: blogData, error: blogError } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("slug", slug)
            .eq("published", true)
            .maybeSingle();
          
          // Convert blog post data to match our interface
          if (blogData) {
            data = {
              ...blogData,
              html_file_path: null,
              is_homepage: false,
              show_in_menu: true,
              show_in_header: true
            };
          }
          error = blogError;
        }

        if (error) {
          setError("Oldal nem található");
          return;
        }

        if (!data) {
          setError("Oldal nem található");
          return;
        }

        // Process the HTML content asynchronously
        console.log('Page loaded successfully:', data.title);
        setPage(data);
        
        // Process HTML content 
        const processed = processHtmlContent(data.html_content);
        setProcessedHtml(processed);
      } catch (err) {
        setError("Hiba történt az oldal betöltésekor");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  // Process HTML content to handle asset URLs and convert .html links
  const processHtmlContent = (htmlContent: string) => {
    let processedHtml = htmlContent;
    
    // Convert logo links to point to homepage
    processedHtml = processedHtml.replace(
      /<a[^>]*href=["'][^"']*["'][^>]*><img[^>]*src=["'][^"']*logo[^"']*["'][^>]*><\/a>/gi,
      (match) => {
        return match.replace(/href=["'][^"']*["']/, 'href="/"');
      }
    );
    
    // Convert .html links to relative links (remove .html extension)
    processedHtml = processedHtml.replace(/href=["']([^"']*\.html)["']/g, (match, url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//')) {
        const relativePath = url.replace(/\.html$/, '').replace(/^\//, '');
        return `href="/${relativePath}"`;
      }
      return match;
    });

    // Get assets path - use edge function for proper CORS headers
    const edgeFunctionUrl = 'https://nabvfsbrrasdsaibnyby.supabase.co/functions/v1/serve-assets';
    
    // Use common-assets path for all assets
    const assetsPath = 'common-assets';
    
    console.log('Using assets path:', `${edgeFunctionUrl}/${assetsPath}`);
    
    // Replace all asset URLs - use edge function for proper CORS headers
    processedHtml = processedHtml.replace(/href=["']\/assets\/([^"']*)["']/g, `href="${edgeFunctionUrl}/${assetsPath}/$1"`);
    processedHtml = processedHtml.replace(/src=["']\/assets\/([^"']*)["']/g, `src="${edgeFunctionUrl}/${assetsPath}/$1"`);
    
    // Handle CSS background images in stylesheets and inline styles
    processedHtml = processedHtml.replace(/url\(["']?\/assets\/([^"')]*)["']?\)/g, `url("${edgeFunctionUrl}/${assetsPath}/$1")`);
    processedHtml = processedHtml.replace(/background-image:\s*url\(["']?\/assets\/([^"')]*)["']?\)/g, `background-image: url("${edgeFunctionUrl}/${assetsPath}/$1")`);
    processedHtml = processedHtml.replace(/background:\s*url\(["']?\/assets\/([^"')]*)["']?\)/g, `background: url("${edgeFunctionUrl}/${assetsPath}/$1")`);
    
    // Replace font URLs and other direct Supabase storage URLs to go through serve-assets function
    processedHtml = processedHtml.replace(/https:\/\/nabvfsbrrasdsaibnyby\.supabase\.co\/assets\/([^"'\s)]*)/g, `${edgeFunctionUrl}/${assetsPath}/$1`);
    
    // Handle @font-face and other CSS font declarations
    processedHtml = processedHtml.replace(/@font-face\s*{[^}]*url\(["']?https:\/\/nabvfsbrrasdsaibnyby\.supabase\.co\/assets\/([^"'\s)]+)["']?\)[^}]*}/g, (match, fontPath) => {
      return match.replace(`https://nabvfsbrrasdsaibnyby.supabase.co/assets/${fontPath}`, `${edgeFunctionUrl}/${assetsPath}/${fontPath}`);
    });

    return processedHtml;
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Oldal betöltése...</span>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {error || "Oldal nem található"}
            </h1>
            <p className="text-muted-foreground">
              A keresett oldal nem létezik vagy nem érhető el.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div 
        className="min-h-screen"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
      <CookieConsent />
    </>
  );
}