import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CookieConsent } from "@/components/CookieConsent";
import { Loader } from "lucide-react";

interface PageContent {
  id: string;
  title: string;
  slug: string;
  html_content: string;
  assets_zip_path?: string | null;
  created_at?: string;
  updated_at?: string;
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

  const assetsPath = "assets"; // Lokális mappa

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[áàâäã]/g, "a")
      .replace(/[éèêë]/g, "e")
      .replace(/[íìîï]/g, "i")
      .replace(/[óòôöõő]/g, "o")
      .replace(/[úùûüű]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[ñ]/g, "n")
      .replace(/\s+/g, " ")
      .trim();

  const fetchPage = useCallback(async () => {
    try {
      const res = await fetch("/pages.json");
      const allPages: PageContent[] = await res.json();

      const mapping = new Map<string, PageContent>();
      allPages.forEach((p) => {
        mapping.set(p.slug, p);
        mapping.set(p.slug.toLowerCase(), p);
        mapping.set(normalizeText(p.title), p);
      });

      // Kézi aliasok
      const alias: Record<string, string> = {
        contacts: "contact",
        comtact: "contact",
        "hirlevel-konzultacio": "konzultacio",
        konzultacio: "konzultacio"
      };

      const realSlug = alias[slug || ""] || slug?.toLowerCase();
      const found = realSlug ? mapping.get(realSlug) : null;

      if (!found) {
        setError("Oldal nem található");
        setLoading(false);
        return;
      }

      let html = found.html_content;

      // Asset-útvonalak átírása
      html = html.replace(/href=["']\/assets\/([^"']*)["']/g, `href="/${assetsPath}/$1"`);
      html = html.replace(/src=["']\/assets\/([^"']*)["']/g, `src="/${assetsPath}/$1"`);
      html = html.replace(/url\(["']?\/assets\/([^"')]+)["']?\)/g, `url("/${assetsPath}/$1")`);
      html = html.replace(/href="([^"]+)\.html"/g, 'href="/$1"');

      setPage(found);
      setProcessedHtml(html);
      setLoading(false);
    } catch (err) {
      console.error("Hiba a JSON betöltése közben:", err);
      setError("Nem sikerült betölteni az oldalt");
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

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
      <div className="min-h-screen" dangerouslySetInnerHTML={{ __html: processedHtml }} />
      <CookieConsent />
    </>
  );
}
