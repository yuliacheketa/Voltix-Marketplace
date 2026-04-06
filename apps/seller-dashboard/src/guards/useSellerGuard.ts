import { getAuthToken } from "@voltix/api-client";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSellerMe, type SellerProfile } from "../api/seller.api";

function readToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return getAuthToken() ?? localStorage.getItem("voltix_token");
}

function decodeJwtPayload(
  token: string
): { sub?: string; role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as { sub?: string; role?: string };
  } catch {
    return null;
  }
}

export type SellerGuardResult =
  | { status: "loading" }
  | { status: "unauthorized" }
  | { status: "forbidden" }
  | { status: "pending"; profile: SellerProfile }
  | { status: "ready"; profile: SellerProfile };

export function useSellerGuard(): SellerGuardResult {
  const [state, setState] = useState<SellerGuardResult>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const token = readToken();
      if (!token) {
        window.dispatchEvent(new CustomEvent("voltix:unauthorized"));
        if (!cancelled) setState({ status: "unauthorized" });
        return;
      }

      const payload = decodeJwtPayload(token);
      const role = payload?.role;
      if (role !== "SELLER") {
        window.dispatchEvent(
          new CustomEvent("voltix:forbidden", { detail: { role } })
        );
        if (!cancelled) setState({ status: "forbidden" });
        return;
      }

      try {
        const profile = await getSellerMe();
        if (cancelled) return;

        if (profile.status === "PENDING") {
          setState({ status: "pending", profile });
          return;
        }

        if (profile.status === "SUSPENDED" || profile.status === "BANNED") {
          window.dispatchEvent(
            new CustomEvent("voltix:forbidden", {
              detail: { reason: profile.status },
            })
          );
          setState({ status: "forbidden" });
          return;
        }

        if (profile.status === "ACTIVE") {
          setState({ status: "ready", profile });
          return;
        }

        window.dispatchEvent(new CustomEvent("voltix:forbidden"));
        setState({ status: "forbidden" });
      } catch (e) {
        if (cancelled) return;
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          window.dispatchEvent(
            new CustomEvent("voltix:forbidden", {
              detail: { reason: "NO_PROFILE" },
            })
          );
        } else if (axios.isAxiosError(e) && e.response?.status === 403) {
          window.dispatchEvent(new CustomEvent("voltix:forbidden"));
        } else {
          window.dispatchEvent(new CustomEvent("voltix:forbidden"));
        }
        setState({ status: "forbidden" });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
