import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Archive } from "lucide-react";

export function StaticPageUpload() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [assetsZip, setAssetsZip] = useState<File | null>(null);
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !slug || !htmlFile) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, slug, and select an HTML file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Read HTML file content
      const htmlContent = await htmlFile.text();
      
      // Upload HTML file
      const htmlFileName = `${slug}.html`;
      const { error: htmlError } = await supabase.storage
        .from('static-pages')
        .upload(htmlFileName, htmlFile, {
          upsert: true,
          contentType: 'text/html'
        });

      if (htmlError) throw htmlError;

      let assetsZipPath = null;
      
      // Upload assets ZIP if provided
      if (assetsZip) {
        const zipFileName = `${slug}-assets.zip`;
        const { error: zipError } = await supabase.storage
          .from('assets')
          .upload(zipFileName, assetsZip, {
            upsert: true,
            contentType: 'application/zip'
          });

        if (zipError) throw zipError;
        assetsZipPath = zipFileName;
      }

      // Insert into database
      const { data: pageData, error: dbError } = await supabase
        .from('static_pages')
        .insert({
          title,
          slug,
          html_content: htmlContent,
          html_file_path: htmlFileName,
          assets_zip_path: assetsZipPath,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Create initial SEO settings if meta description or keywords are provided
      if (pageData && (metaDescription || keywords)) {
        await supabase
          .from('page_seo_settings')
          .insert({
            page_type: 'static',
            page_id: pageData.id,
            meta_title: title,
            meta_description: metaDescription,
            meta_keywords: keywords,
            og_title: title,
            og_description: metaDescription,
            twitter_title: title,
            twitter_description: metaDescription,
          });
      }

      toast({
        title: "Success!",
        description: "Static page uploaded successfully",
      });

      // Reset form
      setTitle("");
      setSlug("");
      setHtmlFile(null);
      setAssetsZip(null);
      setMetaDescription("");
      setKeywords("");
      
    } catch (error) {
      console.error('Error uploading:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your static page",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Page Title</Label>
          <Input
            id="title"
            placeholder="Enter page title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            placeholder="page-url-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="meta-description">Meta Description (Optional)</Label>
          <Textarea
            id="meta-description"
            placeholder="SEO description for this page"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords (Optional)</Label>
          <Input
            id="keywords"
            placeholder="keyword1, keyword2, keyword3"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="html-file">HTML File</Label>
          <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {htmlFile ? htmlFile.name : "Click to select HTML file"}
                  </p>
                  <Input
                    id="html-file"
                    type="file"
                    accept=".html,.htm"
                    onChange={(e) => setHtmlFile(e.target.files?.[0] || null)}
                    className="w-full"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assets-zip">Assets ZIP (Optional)</Label>
          <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-2">
                <Archive className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {assetsZip ? assetsZip.name : "Click to select assets ZIP file"}
                  </p>
                  <Input
                    id="assets-zip"
                    type="file"
                    accept=".zip"
                    onChange={(e) => setAssetsZip(e.target.files?.[0] || null)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isUploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Uploading..." : "Upload Static Page"}
      </Button>
    </form>
  );
}