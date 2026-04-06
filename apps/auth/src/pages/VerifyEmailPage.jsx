import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { verifyEmailAuth } from "../apiService/authApi.js";
import { getApiErrorMessage } from "../utils/apiError.js";

const Box = styled.div`
  padding: 0.85rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.45;
`;

const Ok = styled(Box)`
  background: #e8f5e9;
  color: #1b5e20;
`;

const Err = styled(Box)`
  background: #fde8e8;
  color: #9b1c1c;
`;

const Muted = styled.p`
  margin: 1rem 0 0;
  font-size: 0.9rem;
  color: #5c6470;
`;

const StyledLink = styled(Link)`
  color: #333399;
  font-weight: 600;
`;

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Посилання не містить токена підтвердження.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await verifyEmailAuth(token);
        if (!cancelled) {
          setStatus("ok");
          setMessage(data.message || "Email підтверджено.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(getApiErrorMessage(err, "Не вдалося підтвердити email"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "loading") {
    return <Box>Перевірка посилання…</Box>;
  }

  if (status === "ok") {
    return (
      <>
        <Ok role="status">{message}</Ok>
        <Muted>
          <StyledLink to="/auth/login">Увійти</StyledLink>
        </Muted>
      </>
    );
  }

  return (
    <>
      <Err role="alert">{message}</Err>
      <Muted>
        <StyledLink to="/auth/register">Реєстрація</StyledLink> ·{" "}
        <StyledLink to="/auth/login">Увійти</StyledLink>
      </Muted>
    </>
  );
}
