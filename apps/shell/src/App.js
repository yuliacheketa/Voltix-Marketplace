import React, { Suspense, lazy } from 'react';

const CatalogApp = lazy(() => import('catalog/CatalogApp'));

const App = () => (
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
);

export default App;
