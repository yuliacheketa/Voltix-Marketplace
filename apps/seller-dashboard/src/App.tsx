import React, { useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Spinner } from "@voltix/ui-kit";
import styled from "styled-components";
import type { SellerProfile } from "./api/seller.api";
import { SellerProfileContext } from "./hooks/useSellerProfile";
import { useSellerGuard } from "./guards/useSellerGuard";
import { SellerLayout } from "./components/SellerLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductFormPage } from "./pages/ProductFormPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ShopSettingsPage } from "./pages/ShopSettingsPage";

const FullScreen = styled.div`
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PendingBox = styled.div`
  max-width: 480px;
  margin: 3rem auto;
  padding: 2rem;
  text-align: center;
  background: #fff;
  border: 1px solid #e8e8f4;
  border-radius: 0.75rem;
  font-size: 1.05rem;
  line-height: 1.5;
`;

export default function App() {
  const guard = useSellerGuard();
  const [profileOverride, setProfileOverride] = useState<SellerProfile | null>(
    null
  );

  const profile =
    guard.status === "ready" ? (profileOverride ?? guard.profile) : null;

  const ctx = useMemo(
    () =>
      profile
        ? {
            profile,
            setProfile: (p: SellerProfile) => setProfileOverride(p),
          }
        : null,
    [profile]
  );

  if (guard.status === "loading") {
    return (
      <FullScreen>
        <Spinner />
      </FullScreen>
    );
  }

  if (guard.status === "pending") {
    return (
      <PendingBox>
        Your seller account is under review. We will notify you once approved.
      </PendingBox>
    );
  }

  if (guard.status === "unauthorized" || guard.status === "forbidden") {
    return null;
  }

  if (guard.status === "ready" && ctx) {
    return (
      <SellerProfileContext.Provider value={ctx}>
        <Routes basename="/seller">
          <Route path="/" element={<SellerLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="settings" element={<ShopSettingsPage />} />
          </Route>
        </Routes>
      </SellerProfileContext.Provider>
    );
  }

  return null;
}
