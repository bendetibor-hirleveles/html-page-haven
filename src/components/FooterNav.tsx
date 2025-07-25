// src/components/FooterNav.tsx
import { Link } from "react-router-dom";
import { usePagesMenu } from "@/hooks/usePagesMenu";

export function FooterNav() {
  const { footerMenu } = usePagesMenu();

  return (
    <footer className="p-6 bg-gray-100 text-center">
      <div className="flex justify-center gap-6 flex-wrap">
        {footerMenu.map((page) => (
          <Link
            key={page.slug}
            to={`/${page.slug}`}
            className="text-sm text-gray-600 hover:text-black"
          >
            {page.title}
          </Link>
        ))}
      </div>
    </footer>
  );
}
