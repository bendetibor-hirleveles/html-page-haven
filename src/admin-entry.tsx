import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@/index.css";
import FooterSettingsAdmin from "@/components/admin/FooterSettingsAdmin";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FooterSettingsAdmin />
    </BrowserRouter>
  </React.StrictMode>
);
