import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export function FooterSettings() {
  const [footerText, setFooterText] = useState("");
  const [copyright, setCopyright] = useState("© Tibby.hu");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");

  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    linkedin: "",
    twitter: "",
    pinterest: ""
  });

  const handleSocialChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSave = () => {
    // Itt lehetne elmenteni backendbe vagy JSON fájlba
    console.log({
      footerText,
      copyright,
      ctaText,
      ctaLink,
      socialLinks
    });
    alert("Mentve (jelenleg csak konzolra)");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lábléc beállításai</CardTitle>
        <CardDescription>
          Testreszabhatod a lábléc tartalmát, gombját és a social ikonokat.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="footerText">Szöveges blokk</Label>
          <Textarea
            id="footerText"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="Pl. 'Üdvözlünk oldalunkon...'"
          />
        </div>

        <div>
          <Label htmlFor="copyright">Copyright szöveg</Label>
          <Input
            id="copyright"
            value={copyright}
            onChange={(e) => setCopyright(e.target.value)}
          />
        </div>

        <Separator />

        <div>
          <Label htmlFor="ctaText">Gomb szöveg</Label>
          <Input
            id="ctaText"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="ctaLink">Gomb hivatkozás</Label>
          <Input
            id="ctaLink"
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            placeholder="/valami-oldal"
          />
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-lg mb-2">Social linkek</h3>
          {Object.entries(socialLinks).map(([platform, value]) => (
            <div key={platform} className="mb-2">
              <Label htmlFor={`social-${platform}`}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)} URL
              </Label>
              <Input
                id={`social-${platform}`}
                value={value}
                onChange={(e) => handleSocialChange(platform, e.target.value)}
                placeholder={`https://${platform}.com/felhasznalonev`}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave}>Mentés</Button>
      </CardContent>
    </Card>
  );
}
