import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";

function mount() {
  const container = document.getElementById("root");
  if (!container) return;
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
