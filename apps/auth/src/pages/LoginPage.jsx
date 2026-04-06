import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authStore } from "@voltix/shared-state";
import { loginAuth } from "../apiService/authApi.js";
import { getApiErrorMessage } from "../utils/apiError.js";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2a3140;
`;

const Input = styled.input`
  padding: 0.55rem 0.75rem;
  border: 1px solid #c8ced8;
  border-radius: 8px;
  font-size: 1rem;
`;

const ErrorBox = styled.p`
  margin: 0;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  background: #fde8e8;
  color: #9b1c1c;
  font-size: 0.875rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  background: #333399;
  color: #fafaff;
  cursor: pointer;
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const Footer = styled.p`
  margin: 1rem 0 0;
  text-align: center;
  font-size: 0.9rem;
  color: #5c6470;
`;

const FooterLink = styled(Link)`
  color: #333399;
  font-weight: 600;
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const { user, token } = await loginAuth({ email, password });
      authStore.getState().setSession(user, token);
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err, "Не вдалося увійти"));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Form onSubmit={onSubmit}>
        {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}
        <Label>
          Електронна пошта
          <Input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
          />
        </Label>
        <Label>
          Пароль
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            minLength={8}
          />
        </Label>
        <Button type="submit" disabled={pending}>
          {pending ? "Вхід…" : "Увійти"}
        </Button>
      </Form>
      <Footer>
        Немає акаунта?{" "}
        <FooterLink to="/auth/register">Зареєструватися</FooterLink>
      </Footer>
    </>
  );
}
