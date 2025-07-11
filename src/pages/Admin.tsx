import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaticPageUpload } from "@/components/admin/StaticPageUpload";
import { BlogPostUpload } from "@/components/admin/BlogPostUpload";
import { ContentList } from "@/components/admin/ContentList";
import { GlobalSEOSettings } from "@/components/admin/GlobalSEOSettings";
import { KeywordAnalysis } from "@/components/admin/KeywordAnalysis";
import { PageSEOSettings } from "@/components/admin/PageSEOSettings";
import { MFASetup } from "@/components/MFASetup";
import { FileText, BookOpen, Upload, Globe, Search, Settings, LogOut, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("static-pages");
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [hasMFA, setHasMFA] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      setHasMFA(data?.all?.length > 0);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sikeres kijelentkezés",
        description: "Viszlát!",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Hiba a kijelentkezéskor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your static pages, blog posts, and SEO settings</p>
          </div>
          <div className="flex items-center gap-3">
            {!hasMFA && (
              <Button
                onClick={() => setShowMFASetup(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                2FA beállítása
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Kijelentkezés
            </Button>
          </div>
        </div>

        {showMFASetup && (
          <div className="mb-8">
            <MFASetup onSetupComplete={() => {
              setShowMFASetup(false);
              setHasMFA(true);
            }} />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
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
        </Tabs>
      </div>
    </div>
  );
}