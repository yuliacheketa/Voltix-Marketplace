import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authStore } from "@voltix/shared-state";
import { MicrofrontendHost } from "./components/MicrofrontendHost.jsx";
import { ShellHeader } from "./components/ShellHeader.jsx";

function AuthHydrate() {
  useEffect(() => {
    void authStore.getState().hydrate();
  }, []);
  return null;
}

const CatalogApp = lazy(() => import("catalog/CatalogApp"));
const AuthApp = lazy(() => import("auth/AuthApp"));
const ProfileApp = lazy(() => import("profile/ProfileApp"));
const SellerDashboardApp = lazy(
  () => import("sellerDashboard/SellerDashboardApp")
);

const Main = styled.main`
  padding: 32px 40px 7rem;
`;

const MainRemote = styled.main`
  min-height: 60vh;
  padding: 32px 40px 7rem;
`;

function loadCheckoutRemote() {
  return import("checkout/CheckoutApp");
}

function CheckoutRoute() {
  return (
    <MicrofrontendHost
      remoteImport={loadCheckoutRemote}
      hostId="checkout-root"
      hostClassName="checkout-root-host"
      startHint="Запустіть: npm run dev:remotes (з кореня) або npm run start -w @voltix/checkout (порт 3002)"
    />
  );
}

function AppShell() {
  const navigate = useNavigate();

  useEffect(() => {
    const onUnauthorized = () => navigate("/auth");
    const onForbidden = () => navigate("/");
    window.addEventListener("voltix:unauthorized", onUnauthorized);
    window.addEventListener("voltix:forbidden", onForbidden);
    return () => {
      window.removeEventListener("voltix:unauthorized", onUnauthorized);
      window.removeEventListener("voltix:forbidden", onForbidden);
    };
  }, [navigate]);

  return (
    <>
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
          path="/auth/*"
          element={
            <Main>
              <Suspense fallback={<div>Завантаження…</div>}>
                <AuthApp />
              </Suspense>
            </Main>
          }
        />
        <Route
          path="/profile/*"
          element={
            <Main>
              <Suspense fallback={<div>Завантаження…</div>}>
                <ProfileApp />
              </Suspense>
            </Main>
          }
        />
        <Route
          path="/seller/*"
          element={
            <Main>
              <Suspense fallback={<div>Завантаження…</div>}>
                <SellerDashboardApp />
              </Suspense>
            </Main>
          }
        />
        <Route
          path="/*"
          element={
            <Main>
              <Suspense fallback={<div>Завантаження каталогу…</div>}>
                <CatalogApp />
              </Suspense>
            </Main>
          }
        />
      </Routes>
    </>
  );
}

const App = () => (
  <BrowserRouter>
    <AuthHydrate />
    <AppShell />
  </BrowserRouter>
);

export default App;
