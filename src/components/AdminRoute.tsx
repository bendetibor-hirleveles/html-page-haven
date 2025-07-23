import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("admin_logged_in") === "true";
    setIsAuthenticated(auth);
  }, []);

  if (isAuthenticated === null) {
    // Még nem tudjuk, hogy belépett-e (például frissítés után)
    return null; // vagy: <div>Betöltés...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}
