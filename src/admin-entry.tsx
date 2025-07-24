import React from "react";
import ReactDOM from "react-dom/client";
import Admin from "@/components/admin/Admin"; // vagy ahol épp van
import "@/index.css"; // ha kell stílus

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Admin />
  </React.StrictMode>
);
