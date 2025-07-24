useEffect(() => {
  fetch("/footer.json")
    .then((res) => res.json())
    .then((data) => setSettings(data))
    .catch(() => {
      toast({ title: "Nem sikerült betölteni a footer beállításokat", variant: "destructive" });
    });
}, []);
