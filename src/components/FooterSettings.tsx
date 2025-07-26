import React from "react";

export function FooterSettings() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Footer beállítások</h1>
      <label>
        Copyright szöveg:
        <input type="text" placeholder="© Tibby.hu" />
      </label>
    </div>
  );
}