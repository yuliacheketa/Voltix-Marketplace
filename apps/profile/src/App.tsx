import { getAuthToken } from "@voltix/api-client";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { useAuthHydrated } from "@voltix/shared-state/hooks";
import ProfilePage, { ProfileHome } from "./pages/ProfilePage";
import { AddressesPage } from "./pages/AddressesPage";
import { OrdersPage } from "./pages/OrdersPage";

export default function App() {
  const hydrated = useAuthHydrated();

  if (!hydrated) {
    return <p>Завантаження…</p>;
  }

  if (typeof window !== "undefined" && !getAuthToken()) {
    window.dispatchEvent(new CustomEvent("voltix:unauthorized"));
    return null;
  }

  return (
    <Routes basename="/profile">
      <Route path="/" element={<ProfilePage />}>
        <Route index element={<ProfileHome />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="addresses" element={<AddressesPage />} />
      </Route>
    </Routes>
  );
}
