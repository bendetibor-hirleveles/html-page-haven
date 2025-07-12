import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, ExternalLink, Upload, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  redirect_type: number;
  is_active: boolean;
  created_at: string;
}

export function RedirectManager() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [newRedirect, setNewRedirect] = useState({ from_path: "", to_path: "", redirect_type: 301, is_active: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    try {
      const { data, error } = await supabase
        .from('redirects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedirects(data || []);
    } catch (error: any) {
      toast({
        title: "Hiba a redirectek betöltésekor",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRedirect = async () => {
    if (!newRedirect.from_path || !newRedirect.to_path) {
      toast({
        title: "Hiányzó adatok",
        description: "Kérjük töltse ki az összes mezőt",
        variant: "destructive",
      });
      return;
    }

    // Ensure from_path starts with /
    const fromPath = newRedirect.from_path.startsWith('/') ? newRedirect.from_path : `/${newRedirect.from_path}`;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('redirects')
        .insert({
          from_path: fromPath,
          to_path: newRedirect.to_path,
          redirect_type: newRedirect.redirect_type,
          is_active: newRedirect.is_active,
        });

      if (error) throw error;

      toast({
        title: "Sikeres hozzáadás",
        description: "Redirect sikeresen létrehozva",
      });

      setNewRedirect({ from_path: "", to_path: "", redirect_type: 301, is_active: true });
      fetchRedirects();
    } catch (error: any) {
      toast({
        title: "Hiba a redirect létrehozásakor",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    try {
      const { error } = await supabase
        .from('redirects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sikeres törlés",
        description: "Redirect sikeresen törölve",
      });

      fetchRedirects();
    } catch (error: any) {
      toast({
        title: "Hiba a redirect törlésekor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('redirects')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sikeres módosítás",
        description: `Redirect ${!currentStatus ? 'aktiválva' : 'deaktiválva'}`,
      });

      fetchRedirects();
    } catch (error: any) {
      toast({
        title: "Hiba a redirect módosításakor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header if exists
      const dataLines = lines[0].includes('from_path') ? lines.slice(1) : lines;
      
      const redirectsToImport = dataLines.map((line, index) => {
        const [from_path, to_path, redirect_type, is_active] = line.split(',').map(s => s.trim().replace(/"/g, ''));
        
        if (!from_path || !to_path) {
          throw new Error(`Sor ${index + 1}: from_path és to_path kötelező`);
        }

        return {
          from_path: from_path.startsWith('/') ? from_path : `/${from_path}`,
          to_path,
          redirect_type: parseInt(redirect_type) || 301,
          is_active: is_active === 'false' ? false : true,
        };
      });

      // Bulk insert
      const { error } = await supabase
        .from('redirects')
        .insert(redirectsToImport);

      if (error) throw error;

      toast({
        title: "Sikeres import",
        description: `${redirectsToImport.length} redirect sikeresen importálva`,
      });

      fetchRedirects();
    } catch (error: any) {
      toast({
        title: "Import hiba",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCSVExport = () => {
    const csvContent = [
      'from_path,to_path,redirect_type,is_active',
      ...redirects.map(r => `"${r.from_path}","${r.to_path}",${r.redirect_type},${r.is_active}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redirects_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Betöltés...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Új 301 Redirect Hozzáadása
          </CardTitle>
          <CardDescription>
            Régi URL-ek átirányítása új oldalakra. A from_path automatikusan /-rel kezdődik.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-path">Régi URL (pl: /old-page.html)</Label>
              <Input
                id="from-path"
                placeholder="/old-page.html"
                value={newRedirect.from_path}
                onChange={(e) => setNewRedirect({ ...newRedirect, from_path: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-path">Új URL (pl: /new-page vagy https://external.com)</Label>
              <Input
                id="to-path"
                placeholder="/new-page"
                value={newRedirect.to_path}
                onChange={(e) => setNewRedirect({ ...newRedirect, to_path: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="redirect-type">Redirect típusa</Label>
              <Select 
                value={newRedirect.redirect_type.toString()} 
                onValueChange={(value) => setNewRedirect({ ...newRedirect, redirect_type: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301 - Permanent Redirect</SelectItem>
                  <SelectItem value="302">302 - Temporary Redirect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is-active"
                checked={newRedirect.is_active}
                onCheckedChange={(checked) => setNewRedirect({ ...newRedirect, is_active: checked })}
              />
              <Label htmlFor="is-active">Aktív</Label>
            </div>
          </div>

          <Button onClick={handleAddRedirect} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Mentés..." : "Redirect Hozzáadása"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV Import/Export
          </CardTitle>
          <CardDescription>
            Tömeges redirectek importálása CSV fájlból vagy exportálás. Formátum: from_path,to_path,redirect_type,is_active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                variant="outline"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? "Importálás..." : "CSV Feltöltés"}
              </Button>
            </div>
            <Button 
              onClick={handleCSVExport}
              variant="outline"
              disabled={redirects.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV Letöltés
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p><strong>CSV formátum példa:</strong></p>
            <code className="block bg-muted p-2 rounded mt-1">
              from_path,to_path,redirect_type,is_active<br/>
              /old-page,/new-page,301,true<br/>
              /category/old,/new-category,301,true
            </code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meglévő Redirectek</CardTitle>
          <CardDescription>
            Jelenlegi redirectek kezelése. {redirects.length} redirect található.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redirects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Még nincsenek redirectek. Adjon hozzá egyet a fenti form segítségével.
            </p>
          ) : (
            <div className="space-y-4">
              {redirects.map((redirect) => (
                <div
                  key={redirect.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {redirect.from_path}
                      </code>
                      <span className="text-muted-foreground">→</span>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {redirect.to_path}
                      </code>
                      <span className={`text-xs px-2 py-1 rounded ${
                        redirect.redirect_type === 301 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {redirect.redirect_type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Létrehozva: {new Date(redirect.created_at).toLocaleDateString('hu-HU')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={redirect.is_active}
                      onCheckedChange={() => handleToggleActive(redirect.id, redirect.is_active)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(redirect.to_path, '_blank')}
                      className="p-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRedirect(redirect.id)}
                      className="p-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}