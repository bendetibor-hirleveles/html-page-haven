import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Archive, Folder } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function StaticPageUpload() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [assetsZip, setAssetsZip] = useState<File | null>(null);
  const [assetsFolder, setAssetsFolder] = useState<FileList | null>(null);
  const [useFolder, setUseFolder] = useState(true); // Default to folder upload
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isHomepage, setIsHomepage] = useState(false);
  const [showInMenu, setShowInMenu] = useState(true);
  const [showInHeader, setShowInHeader] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Automatically generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Extract keywords from HTML content
  const extractKeywords = (htmlContent: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Get text content and clean it
      const textContent = doc.body?.textContent || '';
      const words = textContent
        .toLowerCase()
        .replace(/[^\w\sáéíóúöüőűÁÉÍÓÚÖÜŐŰ]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3); // Only words longer than 3 characters
      
      // Count word frequency
      const wordCount: { [key: string]: number } = {};
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
      
      // Get top 10 most frequent words
      const topWords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);
      
      return topWords.join(', ');
    } catch (error) {
      console.error('Error extracting keywords:', error);
      return '';
    }
  };

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
      // Read HTML file content with UTF-8 encoding and extract keywords if not provided
      const buffer = await htmlFile.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const htmlContent = decoder.decode(buffer);
      
      // Ensure UTF-8 charset meta tag is present
      const ensureUtf8Charset = (html: string) => {
        if (!html.includes('charset=') && !html.includes('charset =')) {
          // Add charset meta tag after <head> or at the beginning if no head tag
          if (html.includes('<head>')) {
            return html.replace('<head>', '<head>\n  <meta charset="UTF-8">');
          } else if (html.includes('<html>')) {
            return html.replace('<html>', '<html>\n<head>\n  <meta charset="UTF-8">\n</head>');
          } else {
            return `<head>\n  <meta charset="UTF-8">\n</head>\n${html}`;
          }
        }
        return html;
      };
      
      const processedHtmlContent = ensureUtf8Charset(htmlContent);
      const extractedKeywords = keywords || extractKeywords(processedHtmlContent);
      
      // Upload HTML file with UTF-8 content
      const htmlFileName = `${slug}.html`;
      const htmlBlob = new Blob([processedHtmlContent], { type: 'text/html; charset=utf-8' });
      const { error: htmlError } = await supabase.storage
        .from('static-pages')
        .upload(htmlFileName, htmlBlob, {
          upsert: true,
          contentType: 'text/html; charset=utf-8'
        });

      if (htmlError) throw htmlError;

      let assetsZipPath = null;
      
      // Upload assets (ZIP or folder) to common assets folder
      if (useFolder && assetsFolder) {
        // Upload folder files individually to common assets folder
        for (let i = 0; i < assetsFolder.length; i++) {
          const file = assetsFolder[i];
          const relativePath = file.webkitRelativePath || file.name;
          // Extract filename from relative path and put in common assets folder
          const fileName = relativePath.split('/').pop() || file.name;
          const filePath = `common-assets/${fileName}`;
          
          const { error: fileError } = await supabase.storage
            .from('assets')
            .upload(filePath, file, {
              upsert: true
            });
          
          if (fileError) throw fileError;
        }
        assetsZipPath = 'common-assets';
      } else if (!useFolder && assetsZip) {
        // Upload ZIP file to common assets folder
        try {
          // Upload the ZIP file to common assets folder
          const zipFileName = `common-assets/${slug}-assets.zip`;
          const { error: zipError } = await supabase.storage
            .from('assets')
            .upload(zipFileName, assetsZip, {
              upsert: true,
              contentType: 'application/zip'
            });

          if (zipError) throw zipError;
          
          // Store common assets path
          assetsZipPath = 'common-assets';
          
          console.log('ZIP uploaded to common assets folder:', assetsZipPath);
        } catch (error) {
          console.error('Error uploading ZIP:', error);
          throw error;
        }
      }

      // If this is set as homepage, unset other homepages
      if (isHomepage) {
        await supabase
          .from('static_pages')
          .update({ is_homepage: false })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all existing pages
      }

      // Insert into database
      const { data: pageData, error: dbError } = await supabase
        .from('static_pages')
        .insert({
          title,
          slug,
          html_content: processedHtmlContent,
          html_file_path: htmlFileName,
          assets_zip_path: assetsZipPath,
          is_homepage: isHomepage,
          show_in_menu: showInMenu,
          show_in_header: showInHeader,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Create initial SEO settings if meta description or keywords are provided
      if (pageData && (metaDescription || extractedKeywords)) {
        await supabase
          .from('page_seo_settings')
          .insert({
            page_type: 'static',
            page_id: pageData.id,
            meta_title: title,
            meta_description: metaDescription,
            meta_keywords: extractedKeywords,
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
      setAssetsFolder(null);
      setMetaDescription("");
      setKeywords("");
      setIsHomepage(false);
      setShowInMenu(true);
      setShowInHeader(true);
      
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
          <Label htmlFor="title">Oldal címe</Label>
          <Input
            id="title"
            placeholder="Adja meg az oldal címét"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(generateSlug(e.target.value));
            }}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug (automatikusan generált)</Label>
          <Input
            id="slug"
            placeholder="automatikusan-generalt-slug"
            value={slug}
            onChange={(e) => setSlug(generateSlug(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="meta-description">Meta leírás (Opcionális)</Label>
          <Textarea
            id="meta-description"
            placeholder="SEO leírás ehhez az oldalhoz"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="keywords">Kulcsszavak (Automatikusan generált a HTML alapján)</Label>
          <Input
            id="keywords"
            placeholder="kulcsszó1, kulcsszó2, kulcsszó3"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is-homepage"
            checked={isHomepage}
            onCheckedChange={setIsHomepage}
          />
          <Label htmlFor="is-homepage">Beállítás kezdőoldalként</Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-in-menu"
              checked={showInMenu}
              onCheckedChange={setShowInMenu}
            />
            <Label htmlFor="show-in-menu">Megjelenítés menüben</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-in-header"
              checked={showInHeader}
              onCheckedChange={setShowInHeader}
            />
            <Label htmlFor="show-in-header">Megjelenítés fejléc menüben</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="html-file">HTML Fájl</Label>
          <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {htmlFile ? htmlFile.name : "Kattints a HTML fájl kiválasztásához"}
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

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="upload-type">Assets feltöltés típusa:</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm">ZIP fájl</span>
              <Switch
                id="upload-type"
                checked={useFolder}
                onCheckedChange={setUseFolder}
              />
              <span className="text-sm">Mappa</span>
            </div>
          </div>

          {useFolder ? (
            <div className="space-y-2">
              <Label htmlFor="assets-folder">Assets Mappa (Optional)</Label>
              <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Folder className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {assetsFolder ? `${assetsFolder.length} fájl kiválasztva` : "Kattints a mappa kiválasztásához"}
                      </p>
                      <Input
                        id="assets-folder"
                        type="file"
                        onChange={(e) => setAssetsFolder(e.target.files)}
                        className="w-full"
                        {...({ webkitdirectory: "", directory: "" } as any)}
                        multiple
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="assets-zip">Assets ZIP (Optional)</Label>
              <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Archive className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {assetsZip ? assetsZip.name : "Kattints a ZIP fájl kiválasztásához"}
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
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isUploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Feltöltés..." : "Statikus oldal feltöltése"}
      </Button>
    </form>
  );
}