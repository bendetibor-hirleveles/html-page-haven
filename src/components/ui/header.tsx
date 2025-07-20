import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Page {
  id: number;
  title: string;
  slug: string;
  show_in_top_menu: boolean;
}

export function Header() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchPages = async () => {
      const { data, error } = await supabase
        .from("static_pages")
        .select("id, title, slug, show_in_top_menu")
        .eq("show_in_top_menu", true)
        .order("title");

      if (error) {
        setError("Hiba történt a menüpontok lekérdezésekor.");
        console.error(error);
      } else {
        setPages(data);
      }
      setLoading(false);
    };

    fetchPages();
  }, []);

  if (loading) return null; // vagy egy Skeleton loader
  if (error) return <div className="text-red-600 text-sm">{error}</div>;

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-lg font-bold">
          Hírleveles.hu
        </Link>
        <nav className="space-x-4">
          {pages.map((page) => (
            <Link
              key={page.id}
              to={`/${page.slug}`}
              className={`text-sm font-medium ${
                location.pathname === `/${page.slug}`
                  ? "text-blue-600 underline"
                  : "text-gray-700 hover:text-blue-500"
              }`}
            >
              {page.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
