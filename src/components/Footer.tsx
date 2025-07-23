import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface StaticPage {
  id: number;
  title: string;
  slug: string;
  show_in_footer_menu: boolean;
}

export function Footer() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [footerText, setFooterText] = useState<string>("");

  useEffect(() => {
    const fetchFooterData = async () => {
      // Lekérdezzük a lenti menübe való oldalakat
      const { data: staticPages } = await supabase
        .from("static_pages")
        .select("id, title, slug, show_in_footer_menu")
        .eq("show_in_footer_menu", true);

      // Lekérdezzük a statikus lábléc szöveget
      const { data: seo } = await supabase
        .from("global_seo_settings")
        .select("footer_text")
        .maybeSingle();

      if (staticPages) setPages(staticPages);
      if (seo?.footer_text) setFooterText(seo.footer_text);
    };

    fetchFooterData();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 py-10 px-6 border-t">
      <div className="max-w-5xl mx-auto text-center">
        <img
          src="/assets/logo.svg"
          alt="Logo"
          className="mx-auto h-10 mb-4"
        />
        <nav className="flex flex-wrap justify-center gap-4 mb-4">
          {pages.map((page) => (
            <Link
              key={page.id}
              to={`/${page.slug}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {page.title}
            </Link>
          ))}
        </nav>
        {footerText && (
          <div className="text-sm text-muted-foreground mb-2">
            <span dangerouslySetInnerHTML={{ __html: footerText }} />
          </div>
        )}
        <p className="text-xs text-gray-400">© {currentYear} Tibby.hu</p>
      </div>
    </footer>
  );
}
