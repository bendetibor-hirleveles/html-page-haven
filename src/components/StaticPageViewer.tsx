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
    
    // Handle images and other assets
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

  // Create a complete HTML document for iframe
  const createIframeContent = (htmlContent: string) => {
    const processedContent = processHtmlContent(htmlContent);
    
    return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page?.title || 'Oldal'}</title>
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  ${processedContent}
</body>
</html>`;
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
      <iframe
        src={`data:text/html;charset=utf-8,${encodeURIComponent(createIframeContent(page.html_content))}`}
        className="w-full min-h-screen border-0"
        title={page.title}
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          margin: 0,
          padding: 0,
        }}
      />
      <CookieConsent />
    </>
  );
}