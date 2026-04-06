import { createContext, useContext } from "react";
import type { SellerProfile } from "../api/seller.api";

export type SellerProfileContextValue = {
  profile: SellerProfile;
  setProfile: (p: SellerProfile) => void;
};

export const SellerProfileContext =
  createContext<SellerProfileContextValue | null>(null);

export function useSellerProfile() {
  const ctx = useContext(SellerProfileContext);
  if (!ctx) {
    throw new Error("useSellerProfile must be used within provider");
  }
  return ctx;
}
