import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import { StaticPageViewer } from "./components/StaticPageViewer";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Explicit routes with highest priority */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/blog" element={<Blog />} />
          {/* Home route */}
          <Route path="/" element={<Index />} />
          {/* Dynamic routes - use StaticPageViewer for slugs */}
          <Route path="/:slug" element={<StaticPageViewer />} />
          {/* Catch-all route for 404s */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
