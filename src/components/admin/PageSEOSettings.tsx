import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, BookOpen, Tag, Share2, Code } from "lucide-react";

interface Page {
  id: string;
  title: string;
  slug: string;
  type: 'static' | 'blog';
}

interface PageSEOSettings {
  id?: string;
  page_type: string;
  page_id: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_type: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  custom_head_scripts: string;
  custom_body_scripts: string;
  focus_keywords: string[];
  seo_score: number;
}

export function PageSEOSettings() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [seoSettings, setSeoSettings] = useState<PageSEOSettings>({
    page_type: "",
    page_id: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    canonical_url: "",
    og_title: "",
    og_description: "",
    og_image: "",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    custom_head_scripts: "",
    custom_body_scripts: "",
    focus_keywords: [],
    seo_score: 0,
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetchPageSEOSettings(selectedPage);
    }
  }, [selectedPage]);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const [staticPages, blogPosts] = await Promise.all([
        supabase.from('static_pages').select('id, title, slug'),
        supabase.from('blog_posts').select('id, title, slug')
      ]);

      const allPages = [
        ...(staticPages.data || []).map(page => ({ ...page, type: 'static' as const })),
        ...(blogPosts.data || []).map(post => ({ ...post, type: 'blog' as const }))
      ];

      setPages(allPages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: "Error",
        description: "Failed to load pages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPageSEOSettings = async (pageId: string) => {
    try {
      const selectedPageData = pages.find(p => p.id === pageId);
      if (!selectedPageData) return;

      const { data, error } = await supabase
        .from('page_seo_settings')
        .select('*')
        .eq('page_id', pageId)
        .eq('page_type', selectedPageData.type)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSeoSettings(data);
      } else {
        // Initialize with default values if no settings exist
        setSeoSettings({
          page_type: selectedPageData.type,
          page_id: pageId,
          meta_title: selectedPageData.title,
          meta_description: "",
          meta_keywords: "",
          canonical_url: "",
          og_title: selectedPageData.title,
          og_description: "",
          og_image: "",
          og_type: "website",
          twitter_card: "summary_large_image",
          twitter_title: selectedPageData.title,
          twitter_description: "",
          twitter_image: "",
          custom_head_scripts: "",
          custom_body_scripts: "",
          focus_keywords: [],
          seo_score: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching page SEO settings:', error);
      toast({
        title: "Error",
        description: "Failed to load page SEO settings",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!selectedPage) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('page_seo_settings')
        .upsert(seoSettings);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Page SEO settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save page SEO settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setSeoSettings(prev => ({ ...prev, [field]: value }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !seoSettings.focus_keywords.includes(newKeyword.trim())) {
      setSeoSettings(prev => ({
        ...prev,
        focus_keywords: [...prev.focus_keywords, newKeyword.trim()]
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setSeoSettings(prev => ({
      ...prev,
      focus_keywords: prev.focus_keywords.filter(k => k !== keyword)
    }));
  };

  const calculateSEOScore = () => {
    let score = 0;
    if (seoSettings.meta_title) score += 20;
    if (seoSettings.meta_description) score += 20;
    if (seoSettings.meta_keywords) score += 15;
    if (seoSettings.og_title) score += 15;
    if (seoSettings.og_description) score += 15;
    if (seoSettings.focus_keywords.length > 0) score += 15;
    return score;
  };

  const seoScore = calculateSEOScore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Page SEO Settings</h2>
        <Button onClick={handleSave} disabled={isSaving || !selectedPage}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page to configure SEO" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      <div className="flex items-center gap-2">
                        {page.type === 'static' ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                        {page.title}
                        <Badge variant="outline" className="ml-2">
                          {page.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPage && (
              <div className="flex items-center gap-2">
                <span className="text-sm">SEO Score:</span>
                <Badge variant={seoScore >= 80 ? "default" : seoScore >= 60 ? "secondary" : "destructive"}>
                  {seoScore}%
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPage && (
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Basic SEO
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Keywords
            </TabsTrigger>
            <TabsTrigger value="scripts" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Scripts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={seoSettings.meta_title}
                    onChange={(e) => handleInputChange("meta_title", e.target.value)}
                    placeholder="Page title for search engines"
                  />
                  <p className="text-sm text-muted-foreground">
                    {seoSettings.meta_title.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={seoSettings.meta_description}
                    onChange={(e) => handleInputChange("meta_description", e.target.value)}
                    placeholder="Description for search engines"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    {seoSettings.meta_description.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Meta Keywords</Label>
                  <Input
                    id="meta_keywords"
                    value={seoSettings.meta_keywords}
                    onChange={(e) => handleInputChange("meta_keywords", e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={seoSettings.canonical_url}
                    onChange={(e) => handleInputChange("canonical_url", e.target.value)}
                    placeholder="https://yourwebsite.com/page"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Open Graph & Twitter Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="og_title">Open Graph Title</Label>
                    <Input
                      id="og_title"
                      value={seoSettings.og_title}
                      onChange={(e) => handleInputChange("og_title", e.target.value)}
                      placeholder="Title for social media sharing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_title">Twitter Title</Label>
                    <Input
                      id="twitter_title"
                      value={seoSettings.twitter_title}
                      onChange={(e) => handleInputChange("twitter_title", e.target.value)}
                      placeholder="Title for Twitter sharing"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="og_description">Open Graph Description</Label>
                    <Textarea
                      id="og_description"
                      value={seoSettings.og_description}
                      onChange={(e) => handleInputChange("og_description", e.target.value)}
                      placeholder="Description for social media sharing"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_description">Twitter Description</Label>
                    <Textarea
                      id="twitter_description"
                      value={seoSettings.twitter_description}
                      onChange={(e) => handleInputChange("twitter_description", e.target.value)}
                      placeholder="Description for Twitter sharing"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="og_image">Open Graph Image</Label>
                    <Input
                      id="og_image"
                      value={seoSettings.og_image}
                      onChange={(e) => handleInputChange("og_image", e.target.value)}
                      placeholder="https://yourwebsite.com/og-image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_image">Twitter Image</Label>
                    <Input
                      id="twitter_image"
                      value={seoSettings.twitter_image}
                      onChange={(e) => handleInputChange("twitter_image", e.target.value)}
                      placeholder="https://yourwebsite.com/twitter-image.jpg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Focus Keywords</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add focus keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword}>Add</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {seoSettings.focus_keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scripts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Page-Specific Scripts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom_head_scripts">Custom Head Scripts</Label>
                  <Textarea
                    id="custom_head_scripts"
                    value={seoSettings.custom_head_scripts}
                    onChange={(e) => handleInputChange("custom_head_scripts", e.target.value)}
                    placeholder="<script>&#10;// Page-specific head scripts&#10;</script>"
                    rows={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_body_scripts">Custom Body Scripts</Label>
                  <Textarea
                    id="custom_body_scripts"
                    value={seoSettings.custom_body_scripts}
                    onChange={(e) => handleInputChange("custom_body_scripts", e.target.value)}
                    placeholder="<script>&#10;// Page-specific body scripts&#10;</script>"
                    rows={8}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}