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

        setPage(data);
      } catch (err) {
        setError("Hiba történt az oldal betöltésekor");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  // Process HTML content to handle asset URLs
  const processHtmlContent = (htmlContent: string) => {
    if (!page?.assets_zip_path) return htmlContent;
    
    // Get the public URL for the assets from the correct bucket
    const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl('dummy');
    const baseUrl = publicUrl.replace('/dummy', '');
    const assetsPath = page.assets_zip_path.replace('.zip', '').replace('/', '');
    
    // Replace asset URLs in the HTML
    let processedHtml = htmlContent;
    
    // Handle Bootstrap CSS and JS from /assets/ paths (most common pattern)
    processedHtml = processedHtml.replace(/href=["']?\/assets\/bootstrap\/css\//g, `href="${baseUrl}/${assetsPath}/assets/bootstrap/css/`);
    processedHtml = processedHtml.replace(/src=["']?\/assets\/bootstrap\/js\//g, `src="${baseUrl}/${assetsPath}/assets/bootstrap/js/`);
    processedHtml = processedHtml.replace(/src=["']?\/assets\/js\//g, `src="${baseUrl}/${assetsPath}/assets/js/`);
    processedHtml = processedHtml.replace(/href=["']?\/assets\/css\//g, `href="${baseUrl}/${assetsPath}/assets/css/`);
    processedHtml = processedHtml.replace(/href=["']?\/assets\/fonts\//g, `href="${baseUrl}/${assetsPath}/assets/fonts/`);
    
    // Handle CSS files - multiple patterns
    processedHtml = processedHtml.replace(/href=["']?\.\/css\//g, `href="${baseUrl}/${assetsPath}/css/`);
    processedHtml = processedHtml.replace(/href=["']?css\//g, `href="${baseUrl}/${assetsPath}/css/`);
    processedHtml = processedHtml.replace(/href=["']?\/css\//g, `href="${baseUrl}/${assetsPath}/css/`);
    processedHtml = processedHtml.replace(/href=["']?\.\/style/g, `href="${baseUrl}/${assetsPath}/style`);
    processedHtml = processedHtml.replace(/href=["']?style/g, `href="${baseUrl}/${assetsPath}/style`);
    
    // Handle JS files
    processedHtml = processedHtml.replace(/src=["']?\.\/js\//g, `src="${baseUrl}/${assetsPath}/js/`);
    processedHtml = processedHtml.replace(/src=["']?js\//g, `src="${baseUrl}/${assetsPath}/js/`);
    processedHtml = processedHtml.replace(/src=["']?\/js\//g, `src="${baseUrl}/${assetsPath}/js/`);
    
    // Handle images from /assets/img/
    processedHtml = processedHtml.replace(/src=["']?\/assets\/img\//g, `src="${baseUrl}/${assetsPath}/assets/img/`);
    
    // Handle generic assets
    processedHtml = processedHtml.replace(/href=["']?\.\/assets\//g, `href="${baseUrl}/${assetsPath}/assets/`);
    processedHtml = processedHtml.replace(/src=["']?\.\/assets\//g, `src="${baseUrl}/${assetsPath}/assets/`);
    processedHtml = processedHtml.replace(/href=["']?\/assets\//g, `href="${baseUrl}/${assetsPath}/assets/`);
    processedHtml = processedHtml.replace(/src=["']?\/assets\//g, `src="${baseUrl}/${assetsPath}/assets/`);
    processedHtml = processedHtml.replace(/url\(["']?\/assets\//g, `url("${baseUrl}/${assetsPath}/assets/`);
    processedHtml = processedHtml.replace(/url\(["']?\.\/assets\//g, `url("${baseUrl}/${assetsPath}/assets/`);
    
    // Handle relative paths for images
    processedHtml = processedHtml.replace(/src=["']?\.\/images\//g, `src="${baseUrl}/${assetsPath}/images/`);
    processedHtml = processedHtml.replace(/src=["']?images\//g, `src="${baseUrl}/${assetsPath}/images/`);
    processedHtml = processedHtml.replace(/src=["']?\/images\//g, `src="${baseUrl}/${assetsPath}/images/`);
    
    // Handle generic relative paths (last resort)
    processedHtml = processedHtml.replace(/href=["']?\.\//g, `href="${baseUrl}/${assetsPath}/`);
    processedHtml = processedHtml.replace(/src=["']?\.\//g, `src="${baseUrl}/${assetsPath}/`);
    
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
        dangerouslySetInnerHTML={{ __html: processHtmlContent(page.html_content) }}
      />
      <CookieConsent />
    </>
  );
}