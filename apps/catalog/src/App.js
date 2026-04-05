import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CatalogHomePage } from "./page/CatalogHomePage.jsx";
import { ProductPage } from "./page/ProductPage.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<CatalogHomePage />} />
    <Route path="/product/:id" element={<ProductPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
