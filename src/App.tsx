import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "@/components/admin/Admin";
import Auth from "@/components/Auth";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import { StaticPageViewer } from "./components/StaticPageViewer";
import { AdminRoute } from "./components/AdminRoute";
import { AuthRoute } from "./components/AuthRoute";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/Footer";
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import { useEffect } from "react";
import { exportFooterSettings, loadFooterSettings } from "@/lib/footerSettings";

const queryClient = new QueryClient();
const wrongScript = document.querySelector("script[src*='swiper.min.min.js']");
if (wrongScript) {
  console.warn("Removing invalid script reference: swiper.min.min.js");
  wrongScript.remove();
}

const App = () => {
  useEffect(() => {
    // Ensure footer_settings.json is available for footer rendering
    loadFooterSettings().then((data) => {
      console.log("Loaded footer settings", data);
    }).catch((err) => {
      console.error("Failed to load footer settings", err);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Autentikációs oldalak */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/*" element={<AuthRoute><Auth /></AuthRoute>} />

            {/* Admin felület és aloldalai */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />

            {/* Blog */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            {/* Statikus oldalak JSON-ből */}
            <Route path="/:slug" element={<StaticPageViewer />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
