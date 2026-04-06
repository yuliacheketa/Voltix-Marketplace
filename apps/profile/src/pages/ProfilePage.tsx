import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";
import { Button, Input } from "@voltix/ui-kit";
import {
  changePassword,
  isAxiosError,
  updateProfile,
} from "../api/profile.api";
import { useProfile } from "../hooks/useProfile";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 2rem;
  max-width: 960px;
  margin: 0 auto;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SideLink = styled(NavLink)`
  padding: 0.6rem 0.85rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #2a2a48;
  text-decoration: none;
  background: #fff;
  border: 1px solid #e0e0f0;

  &:hover {
    background: #f4f4fc;
  }

  &.active {
    background: linear-gradient(135deg, #333399 0%, #4a4ab5 100%);
    color: #fafaff;
    border-color: transparent;
  }
`;

const Main = styled.div`
  min-width: 0;
`;

const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #fff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e8e8f4;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
`;

const SuccessMsg = styled.p`
  margin: 0;
  padding: 0.65rem 0.85rem;
  border-radius: 0.5rem;
  background: #e8f5e9;
  color: #1b5e20;
  font-size: 0.9rem;
  font-weight: 600;
`;

const ErrorText = styled.span`
  color: #c62828;
  font-size: 0.8rem;
  font-weight: 500;
`;

const PasswordPanel = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e8e8f4;
`;

const PasswordToggle = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: 700;
  color: #333399;
  cursor: pointer;
  text-align: left;

  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
`;

const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PasswordForm = styled.form`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

export function ProfileHome() {
  const { user, loading, error, refetch } = useProfile();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [pwOpen, setPwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwFieldErrors, setPwFieldErrors] = useState<Record<string, string>>(
    {}
  );
  const [pwClientError, setPwClientError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
      setAvatarUrl(user.avatarUrl ?? "");
    }
  }, [user]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSaved(false);
    try {
      await updateProfile({
        name,
        phone: phone.trim() === "" ? null : phone.trim(),
        avatarUrl: avatarUrl.trim() === "" ? null : avatarUrl.trim(),
      });
      setSaved(true);
      await refetch();
    } catch (err) {
      setSubmitError(
        isAxiosError(err)
          ? String(err.response?.data ?? err.message)
          : "Failed to update"
      );
    }
  }

  function validatePasswordClient(): boolean {
    setPwClientError(null);
    setPwFieldErrors({});
    if (newPassword.length < 8) {
      setPwClientError("New password must be at least 8 characters.");
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPwClientError("New password must contain an uppercase letter.");
      return false;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPwClientError("New password must contain a number.");
      return false;
    }
    if (newPassword === currentPassword) {
      setPwClientError("New password must differ from current password.");
      return false;
    }
    return true;
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwFieldErrors({});
    if (!validatePasswordClient()) return;
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPwOpen(false);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        const data = err.response.data as {
          errors?: Array<{ field?: string; message?: string }>;
        };
        const next: Record<string, string> = {};
        if (Array.isArray(data?.errors)) {
          for (const row of data.errors) {
            if (row.field && row.message) next[row.field] = row.message;
          }
        }
        setPwFieldErrors(next);
      }
    }
  }

  if (loading && !user) {
    return <p>Завантаження…</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }
  if (!user) {
    return (
      <FormStack>
        <p>Не вдалося відобразити профіль. Спробуйте оновити сторінку.</p>
      </FormStack>
    );
  }

  return (
    <FormStack>
      <ProfileForm onSubmit={handleProfileSubmit}>
        <Title>Профіль</Title>
        <Field>
          Ім’я
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field>
          Телефон
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+380971234567"
          />
        </Field>
        <Field>
          URL аватара
          <Input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </Field>
        {submitError ? <ErrorText>{submitError}</ErrorText> : null}
        {saved ? <SuccessMsg>Профіль збережено.</SuccessMsg> : null}
        <div>
          <Button type="submit" variant="primary">
            Зберегти
          </Button>
        </div>
      </ProfileForm>

      <PasswordPanel>
        <PasswordToggle
          type="button"
          onClick={() => setPwOpen((o) => !o)}
          aria-expanded={pwOpen}
        >
          {pwOpen ? "▼" : "▶"} Змінити пароль
        </PasswordToggle>
        {pwOpen ? (
          <PasswordForm onSubmit={handlePasswordSubmit}>
            <Field>
              Поточний пароль
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              {pwFieldErrors.currentPassword ? (
                <ErrorText>{pwFieldErrors.currentPassword}</ErrorText>
              ) : null}
            </Field>
            <Field>
              Новий пароль
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              {pwFieldErrors.newPassword ? (
                <ErrorText>{pwFieldErrors.newPassword}</ErrorText>
              ) : null}
            </Field>
            {pwClientError ? <ErrorText>{pwClientError}</ErrorText> : null}
            <Button type="submit" variant="secondary">
              Оновити пароль
            </Button>
          </PasswordForm>
        ) : null}
      </PasswordPanel>
    </FormStack>
  );
}

export default function ProfilePage() {
  return (
    <Layout>
      <Sidebar>
        <SideLink to="/profile" end>
          Профіль
        </SideLink>
        <SideLink to="/profile/orders">Замовлення</SideLink>
        <SideLink to="/profile/addresses">Адреси</SideLink>
      </Sidebar>
      <Main>
        <Outlet />
      </Main>
    </Layout>
  );
}
