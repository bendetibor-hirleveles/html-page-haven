// Header.tsx – Supabase helyett statikus pages.json alapján

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface Page {
  id: number;
  title: string;
  slug: string;
  show_in_top_menu: boolean;
}

export function Header() {
  const [pages, setPages] = useState<Page[]>([]);
  const location = useLocation();

  useEffect(() => {
    fetch("/pages.json")
      .then((res) => res.json())
      .then((data) => setPages(data.filter((p: Page) => p.show_in_top_menu)))
      .catch((err) => console.error("Hiba a pages.json betöltésekor:", err));
  }, []);

  return (
    <header className="p-4 shadow-md bg-white sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Tibby.hu</Link>
        <nav className="flex space-x-4">
          {pages.map((page) => (
            <Link
              key={page.id}
              to={`/${page.slug}`}
              className={`hover:underline ${location.pathname === `/${page.slug}` ? "font-semibold" : ""}`}
            >
              {page.title}
            </Link>
          ))}
          <Link to="/blog">Blog</Link>
          <Link to="/pricing">Árak</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/auth">Bejelentkezés</Link>
        </nav>
      </div>
    </header>
  );
}
