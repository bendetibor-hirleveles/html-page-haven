import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Archive, Plus, X } from "lucide-react";
import { BlogPostSEOSettings } from "./BlogPostSEOSettings";

export function BlogPostUpload() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [assetsZip, setAssetsZip] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [showInMenu, setShowInMenu] = useState(true);
  const [showInHeader, setShowInHeader] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [blogPostId, setBlogPostId] = useState<string | null>(null);
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
        .from('blog-posts')
        .upload(htmlFileName, htmlFile, {
          upsert: true,
          contentType: 'text/html'
        });

      if (htmlError) throw htmlError;

      let assetsZipPath = null;
      
      // Upload assets ZIP to common assets folder if provided
      if (assetsZip) {
        const zipFileName = `common-assets/${slug}-assets.zip`;
        const { error: zipError } = await supabase.storage
          .from('assets')
          .upload(zipFileName, assetsZip, {
            upsert: true,
            contentType: 'application/zip'
          });

        if (zipError) throw zipError;
        assetsZipPath = 'common-assets';
      }

      // Insert into database
      const { data: blogPostData, error: dbError } = await supabase
        .from('blog_posts')
        .insert({
          title,
          slug,
          html_content: htmlContent,
          html_file_path: htmlFileName,
          assets_zip_path: assetsZipPath,
          published,
          show_in_menu: showInMenu,
          show_in_header: showInHeader,
          tags: tags,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      
      setBlogPostId(blogPostData.id);

      toast({
        title: "Success!",
        description: "Blog post uploaded successfully",
      });

      // Reset form
      setTitle("");
      setSlug("");
      setHtmlFile(null);
      setAssetsZip(null);
      setPublished(false);
      setShowInMenu(true);
      setShowInHeader(true);
      setTags([]);
      setNewTag("");
      setBlogPostId(null);
      
    } catch (error) {
      console.error('Error uploading:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your blog post",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Post Title</Label>
          <Input
            id="title"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            placeholder="post-url-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="published">Publish immediately</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-in-menu"
            checked={showInMenu}
            onCheckedChange={setShowInMenu}
          />
          <Label htmlFor="show-in-menu">Show in menu</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-in-header"
            checked={showInHeader}
            onCheckedChange={setShowInHeader}
          />
          <Label htmlFor="show-in-header">Show in header</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="cursor-pointer">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
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
        {isUploading ? "Uploading..." : "Upload Blog Post"}
      </Button>
      
      {blogPostId && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
          <BlogPostSEOSettings 
            pageId={blogPostId}
            currentTitle={title}
          />
        </div>
      )}
    </form>
  );
}