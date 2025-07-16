import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Archive, FileText } from "lucide-react";
import JSZip from 'jszip';

export function AssetExtractor() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const { toast } = useToast();

  const handleExtractAndUpload = async () => {
    if (!zipFile) {
      toast({
        title: "Hiba",
        description: "Kérlek válassz egy ZIP fájlt!",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    setStatus("ZIP fájl kicsomagolása...");
    setProgress(0);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipFile);
      
      const files = Object.keys(contents.files).filter(filename => 
        !contents.files[filename].dir && 
        filename.startsWith('assets/') &&
        !filename.includes('__MACOSX')
      );

      setStatus(`${files.length} fájl feltöltése...`);
      
      let uploaded = 0;
      
      for (const filename of files) {
        const fileData = await contents.files[filename].async('blob');
        
        // Közös mappába mentés: common-assets/ előtaggal
        const targetPath = `common-assets/${filename.replace('assets/', '')}`;
        
        const { error } = await supabase.storage
          .from('assets')
          .upload(targetPath, fileData, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error('Upload error:', error, 'File:', targetPath);
        } else {
          uploaded++;
          const progressPercent = Math.round((uploaded / files.length) * 100);
          setProgress(progressPercent);
          setStatus(`Feltöltve: ${uploaded}/${files.length}`);
        }
      }

      setStatus(`Kész! ${uploaded} fájl feltöltve a common-assets mappába.`);
      toast({
        title: "Sikeres feltöltés",
        description: `${uploaded} fájl feltöltve a common-assets mappába.`,
      });
      
    } catch (error: any) {
      setStatus(`Hiba: ${error.message}`);
      toast({
        title: "Feltöltési hiba",
        description: error.message,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Assets ZIP Kicsomagolás
        </CardTitle>
        <CardDescription>
          ZIP fájlok kicsomagolása és feltöltése a Supabase storage common-assets mappájába
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="zip-file">ZIP Fájl</Label>
          <div className="flex items-center gap-2">
            <Input
              id="zip-file"
              type="file"
              accept=".zip"
              onChange={(e) => setZipFile(e.target.files?.[0] || null)}
              disabled={isExtracting}
            />
            <Button 
              onClick={handleExtractAndUpload}
              disabled={!zipFile || isExtracting}
              className="min-w-fit"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isExtracting ? "Feltöltés..." : "Kicsomagolás"}
            </Button>
          </div>
        </div>

        {status && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              {status}
            </div>
            {isExtracting && progress > 0 && (
              <div className="space-y-1">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">{progress}%</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}