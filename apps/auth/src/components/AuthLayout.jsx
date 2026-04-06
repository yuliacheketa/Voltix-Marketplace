import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

const Wrap = styled.div`
  max-width: 28rem;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgb(26 26 52 / 0.08);
`;

const Title = styled.h1`
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
`;

const Sub = styled.p`
  margin: 0 0 1.25rem;
  color: #5c6470;
  font-size: 0.9375rem;
`;

function headingForPath(pathname) {
  if (pathname.includes("verify-email")) return "Підтвердження email";
  if (pathname.includes("register")) return "Створення акаунта";
  return "Вхід";
}

function subForPath(pathname) {
  if (pathname.includes("verify-email")) {
    return "Перевірка посилання з листа підтвердження.";
  }
  if (pathname.includes("register")) {
    return "Приєднуйтесь до Voltix Marketplace за допомогою електронної пошти.";
  }
  return "Увійдіть за допомогою електронної пошти та пароля.";
}

export function AuthLayout({ children }) {
  const { pathname } = useLocation();
  return (
    <Wrap>
      <Title>{headingForPath(pathname)}</Title>
      <Sub>{subForPath(pathname)}</Sub>
      {children}
    </Wrap>
  );
}
