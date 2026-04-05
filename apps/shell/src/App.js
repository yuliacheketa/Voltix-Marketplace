import React, { Suspense, lazy } from "react";
import { BrowserRouter } from "react-router-dom";

const CatalogApp = lazy(() => import("catalog/CatalogApp"));

const App = () => (
  <BrowserRouter>
    <div>
      <header className="shell-header">
        <h1>Voltix Marketplace</h1>
      </header>
      <main className="shell-main">
        <Suspense fallback={<div>Loading Catalog...</div>}>
          <CatalogApp />
        </Suspense>
      </main>
    </div>
  </BrowserRouter>
);

export default App;
