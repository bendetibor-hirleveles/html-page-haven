import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FooterSettings {
  footer_text: string;
  cta_button: {
    text: string;
    link: string;
  };
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export function FooterSettings() {
  const [settings, setSettings] = useState<FooterSettings>({
    footer_text: "",
    cta_button: {
      text: "",
      link: "",
    },
    social_links: {},
  });
  const { toast } = useToast();

  useEffect(() => {
    fetch("/footer.json")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {
        toast({ title: "Nem sikerült betölteni a footer beállításokat", variant: "destructive" });
      });
  }, []);

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  const handleCtaChange = (field: "text" | "link", value: string) => {
    setSettings((prev) => ({
      ...prev,
      cta_button: {
        ...prev.cta_button,
        [field]: value,
      },
    }));
  };

  const saveSettings = async () => {
    try {
      const res = await fetch("/api/save-footer-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Hiba mentés közben");

      toast({ title: "Sikeres mentés" });
    } catch (err) {
      toast({ title: "Nem sikerült menteni a beállításokat", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lablec set</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Lablec szoveg</Label>
          <Input value={settings.footer_text} onChange={(e) => handleChange("footer_text", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Gomb szovege</Label>
            <Input value={settings.cta_button.text} onChange={(e) => handleCtaChange("text", e.target.value)} />
          </div>
          <div>
            <Label>Gomb linkje</Label>
            <Input value={settings.cta_button.link} onChange={(e) => handleCtaChange("link", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.keys(settings.social_links).length === 0 && (
            <>
              <Label>Facebook</Label>
              <Input onChange={(e) => handleSocialChange("facebook", e.target.value)} />
              <Label>Instagram</Label>
              <Input onChange={(e) => handleSocialChange("instagram", e.target.value)} />
              <Label>Twitter</Label>
              <Input onChange={(e) => handleSocialChange("twitter", e.target.value)} />
              <Label>LinkedIn</Label>
              <Input onChange={(e) => handleSocialChange("linkedin", e.target.value)} />
              <Label>YouTube</Label>
              <Input onChange={(e) => handleSocialChange("youtube", e.target.value)} />
            </>
          )}
          {Object.entries(settings.social_links).map(([platform, url]) => (
            <div key={platform}>
              <Label>{platform}</Label>
              <Input value={url} onChange={(e) => handleSocialChange(platform, e.target.value)} />
            </div>
          ))}
        </div>

        <Button onClick={saveSettings}>Mentés</Button>
      </CardContent>
    </Card>
  );
}
