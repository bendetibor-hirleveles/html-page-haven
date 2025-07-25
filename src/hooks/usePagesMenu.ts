// src/hooks/usePagesMenu.ts
import { useEffect, useState } from "react";

export interface PageData {
  slug: string;
  title: string;
  show_in_top_menu: boolean;
  show_in_footer_menu: boolean;
  is_homepage?: boolean;
}

export function usePagesMenu() {
  const [pages, setPages] = useState<PageData[]>([]);

  useEffect(() => {
    fetch("/pages.json")
      .then((res) => res.json())
      .then((data) => setPages(data))
      .catch((err) => console.error("Nem sikerült betölteni a pages.json fájlt:", err));
  }, []);

  const topMenu = pages.filter((p) => p.show_in_top_menu);
  const footerMenu = pages.filter((p) => p.show_in_footer_menu);
  const homepage = pages.find((p) => p.is_homepage);

  return { pages, topMenu, footerMenu, homepage };
}
