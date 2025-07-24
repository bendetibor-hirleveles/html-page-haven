import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { loadFooterSettings, saveFooterSettings } from "@/lib/footerSettings";

interface FooterData {
  text: string;
  copyright: string;
  buttonText: string;
  buttonLink: string;
  socials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  };
}

export function FooterSettings() {
  const [data, setData] = useState<FooterData>({
    text: "",
    copyright: "",
    buttonText: "",
    buttonLink: "",
    socials: {},
  });

  const { toast } = useToast();

  useEffect(() => {
    loadFooterSettings().then(setData);
  }, []);

  const handleSave = async () => {
    try {
      await saveFooterSettings(data);
      toast({ title: "Sikeres mentés", description: "A lábléc adatai elmentve." });
    } catch (err) {
      toast({ title: "Hiba", description: "Nem sikerült elmenteni a láblécet.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lablec beallitasok</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text">Szöveges blokk</Label>
          <Textarea
            id="text"
            value={data.text}
            onChange={(e) => setData({ ...data, text: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="copyright">Copyright</Label>
          <Input
            id="copyright"
            value={data.copyright}
            onChange={(e) => setData({ ...data, copyright: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="buttonText">Gomb szöveg</Label>
            <Input
              id="buttonText"
              value={data.buttonText}
              onChange={(e) => setData({ ...data, buttonText: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buttonLink">Gomb link</Label>
            <Input
              id="buttonLink"
              value={data.buttonLink}
              onChange={(e) => setData({ ...data, buttonLink: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="block">Social ikonok</Label>
          {["facebook", "instagram", "twitter", "youtube", "tiktok", "linkedin"].map((platform) => (
            <div key={platform}>
              <Label htmlFor={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Label>
              <Input
                id={platform}
                value={data.socials[platform as keyof FooterData["socials"]] || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    socials: {
                      ...data.socials,
                      [platform]: e.target.value,
                    },
                  })
                }
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave}>Mentés</Button>
      </CardContent>
    </Card>
  );
}
