import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Page {
  id: string;
  title: string;
  slug: string;
  show_in_header?: boolean;
}

export function Header() {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch("/pages.json");
        const allPages: Page[] = await res.json();
        const filtered = allPages.filter(p => p.show_in_header);
        setPages(filtered);
      } catch (err) {
        console.error("Hiba a fejléc oldalak betöltésekor:", err);
      }
    };

    fetchPages();
  }, []);

  return (
    <header className="bg-white shadow p-4 flex justify-between">
      <div className="font-bold text-lg">Tibby.hu</div>
      <nav className="flex gap-4">
        {pages.map((page) => (
          <Link key={page.id} to={`/${page.slug}`} className="hover:underline">
            {page.title}
          </Link>
        ))}
      </nav>
    </header>
  );
}
