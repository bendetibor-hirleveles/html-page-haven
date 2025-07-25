import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function FooterSettings() {
  const [settings, setSettings] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    fetch("/footer.json")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {
        toast({
          title: "Nem sikerült betölteni a footer beállításokat",
          variant: "destructive"
        });
      });
  }, []);

  return (
    <div className="space-y-2">
  <p><strong>Copyright:</strong> {footerSettings?.copyrightText}</p>
  <p><strong>Gomb szöveg:</strong> {footerSettings?.buttonText}</p>
  <p><strong>Facebook:</strong> {footerSettings?.facebook || "Nincs megadva"}</p>
</div>

  );
}
