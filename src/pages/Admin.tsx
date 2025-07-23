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
import { FileText, BookOpen, Upload, Globe, Search, Settings, Link } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("static-pages");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleLogout = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage static pages, blog posts and SEO settings</p>
          </div>
          <Button onClick={handleLogout} variant="ghost">
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
          <TabsList className="grid w-full grid-cols-6">
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
          </TabsList>

          <TabsContent value="static-pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Static Page
                </CardTitle>
                <CardDescription>Upload HTML files and optional assets (ZIP)</CardDescription>
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
                <CardDescription>Upload blog post as HTML + assets</CardDescription>
              </CardHeader>
              <CardContent>
                <BlogPostUpload />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Blog Posts</CardTitle>
                <CardDescription>Manage uploaded blog posts</CardDescription>
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
        </Tabs>
      </div>
    </div>
  );
}
