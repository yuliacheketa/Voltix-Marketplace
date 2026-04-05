import React, { Suspense, lazy, useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import styled from "styled-components";
import { ShellHeader } from "./components/ShellHeader.jsx";

const CatalogApp = lazy(() => import("catalog/CatalogApp"));
const AuthApp = lazy(() => import("auth/AuthApp"));

const Main = styled.main`
  padding: 32px 40px 7rem;
`;

const MainRemote = styled.main`
  min-height: 60vh;
  padding: 32px 40px 7rem;
`;

function CheckoutRoute() {
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

function CompareRoute() {
  const ref = useRef(null);
  const apiRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    import("compareMatrix/CompareApp")
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
  return <div id="compare-root" ref={ref} className="compare-root-host" />;
}

const App = () => (
  <BrowserRouter>
    <ShellHeader />
    <Routes>
      <Route
        path="/checkout/*"
        element={
          <MainRemote>
            <CheckoutRoute />
          </MainRemote>
        }
      />
      <Route
        path="/compare/*"
        element={
          <MainRemote>
            <CompareRoute />
          </MainRemote>
        }
      />
      <Route
        path="/auth/*"
        element={
          <Main>
            <Suspense fallback={<div>Loading…</div>}>
              <AuthApp />
            </Suspense>
          </Main>
        }
      />
      <Route
        path="/*"
        element={
          <Main>
            <Suspense fallback={<div>Loading catalog…</div>}>
              <CatalogApp />
            </Suspense>
          </Main>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
