import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import { StaticPageViewer } from "./components/StaticPageViewer";
import { AdminRoute } from "./components/AdminRoute";
import { AuthRoute } from "./components/AuthRoute";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/Footer";
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import { TopNav } from "@/components/TopNav";
import { FooterNav } from "@/components/FooterNav";

function App() {
  return (
    <>
      <TopNav />
      {/* ... routing and content ... */}
      <FooterNav />
    </>
  );
}


const queryClient = new QueryClient();

const App = () => (
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

export default App;
