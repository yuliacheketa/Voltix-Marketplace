import React, { Suspense, lazy, useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";

const CatalogApp = lazy(() => import("catalog/CatalogApp"));

function CheckoutMount() {
  const ref = useRef(null);
  const apiRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    import("checkout/CheckoutApp")
      .then((m) => {
        if (cancelled || !ref.current) return;
        apiRef.current = m.default;
        apiRef.current.mount(ref.current);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      apiRef.current?.unmount?.();
      apiRef.current = null;
    };
  }, []);
  return <div id="checkout-root" ref={ref} className="checkout-root-host" />;
}

const App = () => (
  <BrowserRouter>
    <div>
      <header className="shell-header">
        <div className="shell-header-inner">
          <h1>Voltix Marketplace</h1>
          <nav className="shell-nav" aria-label="Checkout">
            <a className="shell-nav-link" href="#/cart">
              Cart
            </a>
            <a className="shell-nav-link" href="#/checkout/contact">
              Checkout
            </a>
          </nav>
        </div>
      </header>
      <main className="shell-main">
        <Suspense fallback={<div>Loading Catalog...</div>}>
          <CatalogApp />
        </Suspense>
        <CheckoutMount />
      </main>
    </div>
  </BrowserRouter>
);

export default App;
