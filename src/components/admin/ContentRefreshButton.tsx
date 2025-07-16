import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, CheckCircle, AlertCircle } from "lucide-react";

export function ContentRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
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