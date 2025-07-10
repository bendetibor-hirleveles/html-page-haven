import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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
    <div 
      className="min-h-screen"
      dangerouslySetInnerHTML={{ __html: processHtmlContent(page.html_content) }}
    />
  );
}