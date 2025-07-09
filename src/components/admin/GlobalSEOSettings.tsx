import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Globe, Code, Search, Share2 } from "lucide-react";

export function GlobalSEOSettings() {
  const [settings, setSettings] = useState({
    id: "",
    site_title: "",
    site_description: "",
    site_keywords: "",
    canonical_domain: "",
    google_analytics_id: "",
    google_tag_manager_id: "",
    google_search_console_id: "",
    facebook_pixel_id: "",
    tiktok_pixel_id: "",
    custom_head_scripts: "",
    custom_body_scripts: "",
    open_graph_image: "",
    robots_txt: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('global_seo_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load global SEO settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('global_seo_settings')
        .upsert(settings);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Global SEO settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save global SEO settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading global SEO settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Global SEO Settings</h2>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Tracking
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="scripts" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Scripts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_title">Site Title</Label>
                  <Input
                    id="site_title"
                    value={settings.site_title}
                    onChange={(e) => handleInputChange("site_title", e.target.value)}
                    placeholder="Your Website Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonical_domain">Canonical Domain</Label>
                  <Input
                    id="canonical_domain"
                    value={settings.canonical_domain}
                    onChange={(e) => handleInputChange("canonical_domain", e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => handleInputChange("site_description", e.target.value)}
                  placeholder="Your website description for search engines"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_keywords">Site Keywords</Label>
                <Input
                  id="site_keywords"
                  value={settings.site_keywords}
                  onChange={(e) => handleInputChange("site_keywords", e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="open_graph_image">Default Open Graph Image</Label>
                <Input
                  id="open_graph_image"
                  value={settings.open_graph_image}
                  onChange={(e) => handleInputChange("open_graph_image", e.target.value)}
                  placeholder="https://yourwebsite.com/og-image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots_txt">Robots.txt Content</Label>
                <Textarea
                  id="robots_txt"
                  value={settings.robots_txt}
                  onChange={(e) => handleInputChange("robots_txt", e.target.value)}
                  placeholder="User-agent: *&#10;Disallow: /admin/&#10;Sitemap: /sitemap.xml"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tracking & Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    value={settings.google_analytics_id}
                    onChange={(e) => handleInputChange("google_analytics_id", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
                  <Input
                    id="google_tag_manager_id"
                    value={settings.google_tag_manager_id}
                    onChange={(e) => handleInputChange("google_tag_manager_id", e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_search_console_id">Google Search Console Verification</Label>
                <Input
                  id="google_search_console_id"
                  value={settings.google_search_console_id}
                  onChange={(e) => handleInputChange("google_search_console_id", e.target.value)}
                  placeholder="google-site-verification code"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Pixels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                  <Input
                    id="facebook_pixel_id"
                    value={settings.facebook_pixel_id}
                    onChange={(e) => handleInputChange("facebook_pixel_id", e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok_pixel_id">TikTok Pixel ID</Label>
                  <Input
                    id="tiktok_pixel_id"
                    value={settings.tiktok_pixel_id}
                    onChange={(e) => handleInputChange("tiktok_pixel_id", e.target.value)}
                    placeholder="C4A4..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Scripts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom_head_scripts">Head Scripts</Label>
                <Textarea
                  id="custom_head_scripts"
                  value={settings.custom_head_scripts}
                  onChange={(e) => handleInputChange("custom_head_scripts", e.target.value)}
                  placeholder="<script>&#10;// Custom head scripts here&#10;</script>"
                  rows={8}
                />
                <p className="text-sm text-muted-foreground">
                  Scripts added here will be inserted in the {'<head>'} section of all pages.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_body_scripts">Body Scripts</Label>
                <Textarea
                  id="custom_body_scripts"
                  value={settings.custom_body_scripts}
                  onChange={(e) => handleInputChange("custom_body_scripts", e.target.value)}
                  placeholder="<script>&#10;// Custom body scripts here&#10;</script>"
                  rows={8}
                />
                <p className="text-sm text-muted-foreground">
                  Scripts added here will be inserted before the closing {'</body>'} tag on all pages.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}