import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  getMe,
  type ProfileAddress,
  type ProfileUser,
} from "../api/profile.api";

function getLoadErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const status = e.response?.status;
    const data = e.response?.data as
      | { message?: string; errors?: Array<{ message?: string }> }
      | undefined;
    if (status === 401 || status === 403) {
      return "Потрібна авторизація. Увійдіть ще раз.";
    }
    const firstErr = data?.errors?.find((x) => x?.message)?.message;
    if (firstErr) return firstErr;
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }
    if (e.message) return e.message;
  }
  if (e instanceof Error) return e.message;
  return "Не вдалося завантажити профіль";
}

export function useProfile() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [addresses, setAddresses] = useState<ProfileAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMe();
      setUser(data.user);
      setAddresses(data.addresses);
    } catch (e) {
      setError(getLoadErrorMessage(e));
      setUser(null);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { user, addresses, loading, error, refetch };
}
