import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaticPageUpload } from "@/components/admin/StaticPageUpload";
import { BlogPostUpload } from "@/components/admin/BlogPostUpload";
import { ContentList } from "@/components/admin/ContentList";
import { GlobalSEOSettings } from "@/components/admin/GlobalSEOSettings";
import { KeywordAnalysis } from "@/components/admin/KeywordAnalysis";
import { PageSEOSettings } from "@/components/admin/PageSEOSettings";
import { RedirectManager } from "@/components/admin/RedirectManager";
import { ContentRefreshButton } from "@/components/admin/ContentRefreshButton";
import { AssetExtractor } from "@/components/admin/AssetExtractor";
import { FooterSettings } from "@/components/admin/FooterSettings";
import { FileText, BookOpen, Upload, Globe, Search, Settings, LogOut, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FooterSettingsAdmin() {
  const [activeTab, setActiveTab] = useState("footer-settings");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_logged_in") === "true";
    setIsLoggedIn(stored);

    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleLogin = () => {
    if (password === "admin123") {
      localStorage.setItem("admin_logged_in", "true");
      setIsLoggedIn(true);
    } else {
      toast({
        title: "Hibás jelszó",
        description: "Próbáld újra!",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    toast({
      title: "Sikeres kijelentkezés",
      description: "Viszlát!"
    });
    navigate("/auth");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Admin belépés</h1>
          <input
            type="password"
            className="w-full border px-3 py-2 mb-4"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin} className="w-full">Belépés</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Statikus oldalak, blogposztok és SEO beallitasok kezelese</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Kijelentkezés
          </Button>
        </div>

        <div className="mb-6">
          <ContentRefreshButton />
        </div>

        <div className="mb-6">
          <AssetExtractor />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="static-pages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Static Pages
            </TabsTrigger>
            <TabsTrigger value="blog-posts" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="global-seo" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Global SEO
            </TabsTrigger>
            <TabsTrigger value="page-seo" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Page SEO
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Keywords
            </TabsTrigger>
            <TabsTrigger value="redirects" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Redirectek
            </TabsTrigger>
        //    <TabsTrigger value="footer-settings" className="flex items-center gap-2">
        //      <Settings className="h-4 w-4" />
        //      Lábléc
        //    </TabsTrigger>
          </TabsList>

          <TabsContent value="static-pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Static Page
                </CardTitle>
                <CardDescription>
                  Upload HTML files and optional assets (CSS, images, etc.) in a ZIP file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StaticPageUpload />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Static Pages</CardTitle>
                <CardDescription>Manage your uploaded static pages</CardDescription>
              </CardHeader>
              <CardContent>
                <ContentList type="static" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog-posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Blog Post
                </CardTitle>
                <CardDescription>
                  Upload HTML files and optional assets (CSS, images, etc.) in a ZIP file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlogPostUpload />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Blog Posts</CardTitle>
                <CardDescription>Manage your uploaded blog posts</CardDescription>
              </CardHeader>
              <CardContent>
                <ContentList type="blog" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="global-seo" className="space-y-6">
            <GlobalSEOSettings />
          </TabsContent>

          <TabsContent value="page-seo" className="space-y-6">
            <PageSEOSettings />
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <KeywordAnalysis />
          </TabsContent>

          <TabsContent value="redirects" className="space-y-6">
            <RedirectManager />
          </TabsContent>

          <TabsContent value="footer-settings" className="space-y-6">
            <FooterSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
