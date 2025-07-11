import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Settings, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
        applyCookieSettings(savedPreferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Apply analytics cookies (Google Analytics, etc.)
    if (prefs.analytics) {
      // Enable Google Analytics if it exists
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
    } else {
      // Disable analytics
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
    }

    // Apply marketing cookies
    if (prefs.marketing) {
      // Enable marketing cookies (Facebook Pixel, etc.)
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('consent', 'update', {
          'ad_storage': 'granted'
        });
      }
    } else {
      // Disable marketing cookies
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('consent', 'update', {
          'ad_storage': 'denied'
        });
      }
    }
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    applyCookieSettings(prefs);
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    savePreferences(necessaryOnly);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">Süti beállítások</h3>
                  <p className="text-sm text-muted-foreground">
                    Ez a weboldal sütiket használ a felhasználói élmény javítása érdekében. 
                    A "Szükséges" sütik a weboldal alapvető működéséhez szükségesek és nem tilthatók le.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={acceptAll} size="sm">
                    <Check className="h-4 w-4 mr-1" />
                    Minden elfogadása
                  </Button>
                  <Button onClick={acceptNecessary} variant="outline" size="sm">
                    Csak szükséges
                  </Button>
                  <Button 
                    onClick={() => setShowSettings(true)} 
                    variant="ghost" 
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Beállítások
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={acceptNecessary}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Süti beállítások
            </DialogTitle>
            <DialogDescription>
              Válassza ki, milyen típusú sütiket szeretne engedélyezni. 
              A beállításokat bármikor módosíthatja.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Necessary Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Szükséges sütik</Label>
                  <p className="text-sm text-muted-foreground">
                    Ezek a sütik a weboldal alapvető működéséhez szükségesek és nem tilthatók le.
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </div>

            <Separator />

            {/* Analytics Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Analitikai sütik</Label>
                  <p className="text-sm text-muted-foreground">
                    Segítik megérteni, hogyan használják a látogatók a weboldalt. 
                    Ezek az adatok névtelenek és csak statisztikai célokat szolgálnak.
                  </p>
                </div>
                <Switch 
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, analytics: checked }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Marketing Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Marketing sütik</Label>
                  <p className="text-sm text-muted-foreground">
                    Releváns hirdetések megjelenítésére és a marketing kampányok 
                    hatékonyságának mérésére szolgálnak.
                  </p>
                </div>
                <Switch 
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Preference Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Preferencia sütik</Label>
                  <p className="text-sm text-muted-foreground">
                    A weboldal személyre szabásához és az Ön preferenciáinak 
                    megjegyzéséhez használatosak.
                  </p>
                </div>
                <Switch 
                  checked={preferences.preferences}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, preferences: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={saveCustomPreferences} className="flex-1">
                Beállítások mentése
              </Button>
              <Button onClick={acceptAll} variant="outline" className="flex-1">
                Minden elfogadása
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}