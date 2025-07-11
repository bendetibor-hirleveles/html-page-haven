import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CookieConsent } from "@/components/CookieConsent";
import { Loader } from "lucide-react";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  html_content: string;
  assets_zip_path: string | null;
}

export function StaticPageViewer() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from("static_pages")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) {
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
    
    // Replace common asset patterns with the correct storage URLs
    processedHtml = processedHtml.replace(/href="\/assets\//g, `href="${baseUrl}/${assetsPath}/assets/`);
    processedHtml = processedHtml.replace(/src="\/assets\//g, `src="${baseUrl}/${assetsPath}/assets/`);
    processedHtml = processedHtml.replace(/url\(\/assets\//g, `url(${baseUrl}/${assetsPath}/assets/`);
    
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
      <style dangerouslySetInnerHTML={{
        __html: `
          .static-page-reset {
            all: initial !important;
            display: block !important;
            min-height: 100vh !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            background: white !important;
            color: black !important;
          }
          .static-page-reset * {
            box-sizing: border-box !important;
          }
          .static-page-reset img {
            max-width: 100% !important;
            height: auto !important;
          }
          .static-page-reset a {
            color: inherit !important;
            text-decoration: none !important;
          }
          .static-page-reset h1, .static-page-reset h2, .static-page-reset h3,
          .static-page-reset h4, .static-page-reset h5, .static-page-reset h6 {
            margin: 0 !important;
            padding: 0 !important;
            font-weight: bold !important;
          }
          .static-page-reset p {
            margin: 0 !important;
            padding: 0 !important;
          }
        `
      }} />
      <div 
        className="min-h-screen static-page-reset"
        dangerouslySetInnerHTML={{ __html: processHtmlContent(page.html_content) }}
      />
      <CookieConsent />
    </>
  );
}