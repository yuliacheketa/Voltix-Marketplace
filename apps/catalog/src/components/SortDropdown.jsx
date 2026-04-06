import React from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { colors } from "@voltix/ui-kit";

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${colors.textSecondary};
`;

const Select = styled.select`
  font-family: inherit;
  font-size: 0.9375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid ${colors.ghostBorder};
  background: ${colors.surface};
  color: ${colors.text};
  min-width: 11rem;
`;

const OPTIONS = [
  { value: "price_asc", label: "Ціна: від дешевших" },
  { value: "price_desc", label: "Ціна: від дорожчих" },
  { value: "rating", label: "За рейтингом" },
  { value: "newest", label: "Спочатку нові" },
];

export function SortDropdown() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get("sort") ?? "newest";

  const onChange = (e) => {
    const v = e.target.value;
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (v === "newest") p.delete("sort");
        else p.set("sort", v);
        return p;
      },
      { replace: true }
    );
  };

  const value = OPTIONS.some((o) => o.value === sort) ? sort : "newest";

  return (
    <Label>
      Сортування
      <Select value={value} onChange={onChange} aria-label="Сортувати товари">
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Label>
  );
}
