import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@/index.css";
import Admin from "@/components/admin/FooterSettingsAdmin.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Admin />
    </BrowserRouter>
  </React.StrictMode>
);
