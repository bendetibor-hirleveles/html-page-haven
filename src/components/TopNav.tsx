// src/components/TopNav.tsx
import { Link } from "react-router-dom";
import { usePagesMenu } from "@/hooks/usePagesMenu";

export function TopNav() {
  const { topMenu } = usePagesMenu();

  return (
    <nav className="flex gap-4 p-4 bg-white shadow">
      {topMenu.map((page) => (
        <Link
          key={page.slug}
          to={`/${page.slug}`}
          className="text-blue-600 hover:underline"
        >
          {page.title}
        </Link>
      ))}
    </nav>
  );
}
