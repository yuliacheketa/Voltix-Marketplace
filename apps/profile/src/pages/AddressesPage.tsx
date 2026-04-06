import React, { useState } from "react";
import styled from "styled-components";
import { Badge, Button, Input } from "@voltix/ui-kit";
import {
  createAddress,
  deleteAddress,
  isAxiosError,
  updateAddress,
  type CreateAddressPayload,
} from "../api/profile.api";
import { useProfile } from "../hooks/useProfile";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
`;

const Card = styled.article`
  background: #fff;
  border: 1px solid #e8e8f4;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-weight: 700;
`;

const CardBody = styled.div`
  font-size: 0.95rem;
  line-height: 1.45;
  color: #333;
`;

const CardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FormPanel = styled.div`
  background: #fff;
  border: 1px solid #e8e8f4;
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
`;

const FieldError = styled.span`
  color: #c62828;
  font-size: 0.8rem;
  font-weight: 500;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.85rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
`;

function extractFieldErrors(err: unknown): Record<string, string> {
  if (!isAxiosError(err) || !err.response?.data) return {};
  const d = err.response.data as Record<string, unknown>;
  const out: Record<string, string> = {};
  if (Array.isArray(d.errors)) {
    for (const row of d.errors as { field?: string; message?: string }[]) {
      if (row.field && row.message) out[row.field] = row.message;
      if (!row.field && row.message) out._general = row.message;
    }
    return out;
  }
  if (d.errors && typeof d.errors === "object" && !Array.isArray(d.errors)) {
    const fe = d.errors as Record<string, string[] | undefined>;
    for (const [k, v] of Object.entries(fe)) {
      if (v?.[0]) out[k] = v[0];
    }
  }
  return out;
}

const emptyForm: CreateAddressPayload = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  zip: "",
  country: "",
  label: "",
  state: "",
  isDefault: false,
};

export function AddressesPage() {
  const { addresses, loading, error, refetch } = useProfile();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAddressPayload>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof CreateAddressPayload>(
    key: K,
    value: CreateAddressPayload[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      const payload: CreateAddressPayload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        zip: form.zip.trim(),
        country: form.country.trim().toUpperCase(),
        isDefault: form.isDefault ?? false,
      };
      if (form.label?.trim()) payload.label = form.label.trim();
      if (form.state?.trim()) payload.state = form.state.trim();
      await createAddress(payload);
      setForm(emptyForm);
      setShowForm(false);
      await refetch();
    } catch (err) {
      setFieldErrors(extractFieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetDefault(id: string) {
    await updateAddress(id, { isDefault: true });
    await refetch();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Видалити цю адресу?")) return;
    await deleteAddress(id);
    await refetch();
  }

  if (loading && addresses.length === 0) {
    return <p>Завантаження…</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Wrap>
      <TitleRow>
        <Title>Адреси доставки</Title>
        <Button
          type="button"
          variant="primary"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Скасувати" : "Додати адресу"}
        </Button>
      </TitleRow>

      {showForm ? (
        <FormPanel as="form" onSubmit={handleCreate}>
          <strong>Нова адреса</strong>
          <FormGrid>
            <Field>
              Підпис (необов’язково)
              <Input
                value={form.label ?? ""}
                onChange={(e) => setField("label", e.target.value)}
              />
              {fieldErrors.label ? (
                <FieldError>{fieldErrors.label}</FieldError>
              ) : null}
            </Field>
            <Field>
              Повне ім’я
              <Input
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                required
              />
              {fieldErrors.fullName ? (
                <FieldError>{fieldErrors.fullName}</FieldError>
              ) : null}
            </Field>
            <Field>
              Телефон
              <Input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+380971234567"
                required
              />
              {fieldErrors.phone ? (
                <FieldError>{fieldErrors.phone}</FieldError>
              ) : null}
            </Field>
            <Field>
              Вулиця
              <Input
                value={form.street}
                onChange={(e) => setField("street", e.target.value)}
                required
              />
              {fieldErrors.street ? (
                <FieldError>{fieldErrors.street}</FieldError>
              ) : null}
            </Field>
            <Field>
              Місто
              <Input
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                required
              />
              {fieldErrors.city ? (
                <FieldError>{fieldErrors.city}</FieldError>
              ) : null}
            </Field>
            <Field>
              Область (необов’язково)
              <Input
                value={form.state ?? ""}
                onChange={(e) => setField("state", e.target.value)}
              />
              {fieldErrors.state ? (
                <FieldError>{fieldErrors.state}</FieldError>
              ) : null}
            </Field>
            <Field>
              Індекс
              <Input
                value={form.zip}
                onChange={(e) => setField("zip", e.target.value)}
                required
              />
              {fieldErrors.zip ? (
                <FieldError>{fieldErrors.zip}</FieldError>
              ) : null}
            </Field>
            <Field>
              Країна (ISO2)
              <Input
                value={form.country}
                onChange={(e) =>
                  setField("country", e.target.value.toUpperCase().slice(0, 2))
                }
                maxLength={2}
                required
              />
              {fieldErrors.country ? (
                <FieldError>{fieldErrors.country}</FieldError>
              ) : null}
            </Field>
          </FormGrid>
          <Field>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={form.isDefault ?? false}
                onChange={(e) => setField("isDefault", e.target.checked)}
              />
              За замовчуванням
            </CheckboxLabel>
          </Field>
          {fieldErrors._general ? (
            <FieldError>{fieldErrors._general}</FieldError>
          ) : null}
          <Button type="submit" variant="primary" disabled={submitting}>
            Зберегти адресу
          </Button>
        </FormPanel>
      ) : null}

      {addresses.map((a) => (
        <Card key={a.id}>
          <CardTitle>
            {a.label?.trim() || "Адреса"}
            {a.isDefault ? (
              <Badge tone="success">За замовчуванням</Badge>
            ) : null}
          </CardTitle>
          <CardBody>
            <div>{a.fullName}</div>
            <div>{a.phone}</div>
            <div>
              {a.street}, {a.city}
              {a.state ? `, ${a.state}` : ""} {a.zip}, {a.country}
            </div>
          </CardBody>
          <CardActions>
            {!a.isDefault ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleSetDefault(a.id)}
              >
                Зробити основною
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              onClick={() => void handleDelete(a.id)}
            >
              Видалити
            </Button>
          </CardActions>
        </Card>
      ))}
    </Wrap>
  );
}
