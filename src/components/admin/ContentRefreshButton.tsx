import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, CheckCircle, AlertCircle, Upload, FileText, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContentRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [importFiles, setImportFiles] = useState<FileList | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [lastUpload, setLastUpload] = useState<Date | null>(null);
  const [lastImport, setLastImport] = useState<Date | null>(null);
  const { toast } = useToast();

  const refreshAllContent = async () => {
    setIsRefreshing(true);
    
    try {
      toast({
        title: "Frissítés kezdődik...",
        description: "Asset hivatkozások és fájlnevek frissítése folyamatban",
      });

      // Call the refresh-content edge function
      const { data, error } = await supabase.functions.invoke('refresh-content', {
        body: { action: 'refresh_all' }
      });

      if (error) {
        throw new Error(`Frissítési hiba: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Ismeretlen hiba történt');
      }

      setLastRefresh(new Date());
      
      toast({
        title: "Sikeres frissítés! ✅",
        description: `Frissítve: ${data.updated.static_pages} statikus oldal, ${data.updated.blog_posts} blog poszt`,
      });

    } catch (error: any) {
      console.error('Refresh error:', error);
      toast({
        title: "Hiba a frissítés során",
        description: error.message || "Ismeretlen hiba történt",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateHtmlContent = async () => {
    if (!htmlFile) {
      toast({
        title: "Nincs fájl kiválasztva",
        description: "Kérjük válasszon ki egy HTML fájlt",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Read HTML file content
      const buffer = await htmlFile.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const htmlContent = decoder.decode(buffer);

      // Extract slug from filename (remove .html extension)
      const slug = htmlFile.name.replace('.html', '').replace('.htm', '');
      
      // Find existing page by slug
      const { data: existingPage, error: fetchError } = await supabase
        .from('static_pages')
        .select('*')
        .eq('slug', slug)
        .single();

      if (fetchError) {
        throw new Error(`Oldal nem található: ${slug}`);
      }

      // Update HTML content
      const { error: updateError } = await supabase
        .from('static_pages')
        .update({
          html_content: htmlContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPage.id);

      if (updateError) {
        throw new Error(`Frissítési hiba: ${updateError.message}`);
      }

      setLastUpload(new Date());

      toast({
        title: "HTML tartalom frissítve! ✅",
        description: `Az oldal (${slug}) sikeresen frissítve`,
      });

      // Automatically run asset refresh after HTML update
      await refreshAllContent();

    } catch (error: any) {
      console.error('HTML upload error:', error);
      toast({
        title: "Hiba a HTML frissítés során",
        description: error.message || "Ismeretlen hiba történt",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const importNewContent = async () => {
    if (!importFiles || importFiles.length === 0) {
      toast({
        title: "Nincsenek fájlok kiválasztva",
        description: "Kérjük válasszon ki HTML fájlokat importáláshoz",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    try {
      toast({
        title: "Import kezdődik...",
        description: `${importFiles.length} HTML fájl importálása folyamatban`,
      });

      // Read all HTML files
      const htmlFiles = [];
      for (let i = 0; i < importFiles.length; i++) {
        const file = importFiles[i];
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        const htmlContent = decoder.decode(buffer);
        
        htmlFiles.push({
          fileName: file.name,
          htmlContent
        });
      }

      // Call the import-new-content edge function
      const { data, error } = await supabase.functions.invoke('import-new-content', {
        body: { htmlFiles }
      });

      if (error) {
        throw new Error(`Import hiba: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Ismeretlen hiba történt');
      }

      setLastImport(new Date());
      
      toast({
        title: "Import befejezve! ✅",
        description: `${data.summary.imported} új blogposzt importálva, ${data.summary.skipped} kihagyva, ${data.summary.errors} hiba`,
      });

      // Clear the file input
      setImportFiles(null);
      const fileInput = document.getElementById('import-files') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Hiba az import során",
        description: error.message || "Ismeretlen hiba történt",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCcw className="h-5 w-5" />
          Tartalmat frissítő
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Ez a gomb egy kattintással:</p>
          <ul className="mt-2 space-y-1 ml-4">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Frissíti az asset hivatkozásokat (/assets/ → /common-assets/)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Javítja a hibás fájlneveket
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Törli a böngésző cache-t
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Szinkronizálja a storage-ot az adatbázissal
            </li>
          </ul>
        </div>

        {lastRefresh && (
          <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded border">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Utoljára frissítve: {lastRefresh.toLocaleString('hu-HU')}
            </span>
          </div>
        )}

        {lastUpload && (
          <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              HTML frissítve: {lastUpload.toLocaleString('hu-HU')}
            </span>
          </div>
        )}

        {lastImport && (
          <div className="text-xs text-muted-foreground bg-purple-50 p-2 rounded border">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-purple-600" />
              Import befejezve: {lastImport.toLocaleString('hu-HU')}
            </span>
          </div>
        )}

        <Button 
          onClick={refreshAllContent}
          disabled={isRefreshing}
          className="w-full"
          size="lg"
        >
          {isRefreshing ? (
            <>
              <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
              Frissítés folyamatban...
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Mindent frissít most!
            </>
          )}
        </Button>

        <div className="border-t pt-4 space-y-4">
          <div className="text-sm font-medium">HTML tartalom frissítése</div>
          <div className="space-y-2">
            <Label htmlFor="html-file">HTML fájl (fájlnév = slug)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="html-file"
                type="file"
                accept=".html,.htm"
                onChange={(e) => setHtmlFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button
                onClick={updateHtmlContent}
                disabled={isUploading || !htmlFile}
                variant="outline"
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Feltöltés...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Frissít
                  </>
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              A fájlnév alapján keresi meg a megfelelő oldalt (pl. hirleveleshu-megirjuk-a-penzt.html)
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="text-sm font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Új blogposztok importálása
          </div>
          <div className="space-y-2">
            <Label htmlFor="import-files">Több HTML fájl egyszerre (ékezet nélküli slugok)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="import-files"
                type="file"
                accept=".html,.htm"
                multiple
                onChange={(e) => setImportFiles(e.target.files)}
                className="flex-1"
              />
              <Button
                onClick={importNewContent}
                disabled={isImporting || !importFiles || importFiles.length === 0}
                variant="default"
                size="sm"
              >
                {isImporting ? (
                  <>
                    <Plus className="h-4 w-4 mr-2 animate-spin" />
                    Import...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Importál
                  </>
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Automatikusan létrehozza a slug-okat a fájlnevek alapján és kinyeri a címeket. 
              Csak új fájlokat ad hozzá, meglévőket nem írja felül.
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>
            Ez a művelet biztonságos, nem töröl semmit, csak javítja a hivatkozásokat.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}