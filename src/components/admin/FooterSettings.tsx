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
    <div>
      <h2>Footer beállítások</h2>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
    </div>
  );
}
