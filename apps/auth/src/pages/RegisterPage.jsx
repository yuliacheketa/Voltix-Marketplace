import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authStore } from "@voltix/shared-state";
import { registerAuth } from "../apiService/authApi.js";
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

const Select = styled.select`
  padding: 0.55rem 0.75rem;
  border: 1px solid #c8ced8;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
`;

const ErrorBox = styled.p`
  margin: 0;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  background: #fde8e8;
  color: #9b1c1c;
  font-size: 0.875rem;
`;

const SuccessBox = styled.div`
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background: #e8f5e9;
  color: #1b5e20;
  font-size: 0.9rem;
  line-height: 1.45;
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

const Hint = styled.p`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const payload = {
        email,
        password,
        confirmPassword,
        role: role === "SELLER" ? "SELLER" : "CUSTOMER",
        ...(role === "SELLER" && shopName.trim()
          ? { shopName: shopName.trim() }
          : {}),
      };
      const result = await registerAuth(payload);
      authStore.getState().setSession(result.user, result.token);
      setSuccessMessage(
        result.message ||
          "Обліковий запис створено. Підтвердьте email за посиланням з логів API (режим розробки)."
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Не вдалося зареєструватися"));
    } finally {
      setPending(false);
    }
  }

  if (successMessage) {
    return (
      <>
        <SuccessBox role="status">{successMessage}</SuccessBox>
        <Button
          type="button"
          style={{ marginTop: "1rem" }}
          onClick={() => navigate("/")}
        >
          Продовжити
        </Button>
        <Footer>
          Вже є акаунт? <FooterLink to="/auth/login">Увійти</FooterLink>
        </Footer>
      </>
    );
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
          Роль
          <Select
            name="role"
            value={role}
            onChange={(ev) => setRole(ev.target.value)}
          >
            <option value="CUSTOMER">Покупець</option>
            <option value="SELLER">Продавець</option>
          </Select>
        </Label>
        {role === "SELLER" ? (
          <Label>
            Назва магазину
            <Input
              name="shopName"
              type="text"
              autoComplete="organization"
              value={shopName}
              onChange={(ev) => setShopName(ev.target.value)}
              required
              minLength={2}
              maxLength={100}
            />
            <Hint>2–100 символів, унікальна назва.</Hint>
          </Label>
        ) : null}
        <Label>
          Пароль
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            minLength={8}
          />
        </Label>
        <Label>
          Підтвердження пароля
          <Input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(ev) => setConfirmPassword(ev.target.value)}
            required
            minLength={8}
          />
        </Label>
        <Button type="submit" disabled={pending}>
          {pending ? "Створення…" : "Створити акаунт"}
        </Button>
      </Form>
      <Footer>
        Вже є акаунт? <FooterLink to="/auth/login">Увійти</FooterLink>
      </Footer>
    </>
  );
}
