import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { colors } from "@voltix/ui-kit";
import { fetchCategories } from "../apiService/catalogApi.js";
import {
  PRICE_SLIDER_MAX,
  parseCatalogSearchParams,
} from "../utils/catalogSearchParams.js";

const Aside = styled.aside`
  width: 16rem;
  flex-shrink: 0;
  padding: 1rem;
  border-right: 1px solid ${colors.borderSubtle};
  background: ${colors.primaryWash};
  align-self: stretch;
`;

const Title = styled.h2`
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.text};
`;

const Section = styled.div`
  margin-bottom: 1.25rem;
`;

const SectionLabel = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${colors.textSecondary};
  margin-bottom: 0.5rem;
`;

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 0.35rem;
  cursor: pointer;
  color: ${colors.textSecondary};
`;

const RangeRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${colors.muted};
`;

const StockRow = styled(CheckRow)`
  margin-top: 0.5rem;
`;

const StarsSelect = styled.select`
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid ${colors.ghostBorder};
  background: ${colors.surface};
  color: ${colors.text};
  width: 100%;
  box-sizing: border-box;
`;

export function FilterSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = parseCatalogSearchParams(searchParams);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const minVal = parsed.minPrice ?? 0;
  const maxVal = parsed.maxPrice ?? PRICE_SLIDER_MAX;

  const setParams = (mutate) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        mutate(p);
        return p;
      },
      { replace: true }
    );
  };

  const toggleCategory = (id) => {
    setParams((p) => {
      const ids = p.getAll("cat");
      p.delete("cat");
      const has = ids.includes(id);
      const next = has ? ids.filter((x) => x !== id) : [...ids, id];
      next.forEach((cid) => p.append("cat", cid));
    });
  };

  const setMinPrice = (n) => {
    setParams((p) => {
      if (n <= 0) p.delete("min");
      else p.set("min", String(n));
    });
  };

  const setMaxPrice = (n) => {
    setParams((p) => {
      if (n >= PRICE_SLIDER_MAX) p.delete("max");
      else p.set("max", String(n));
    });
  };

  const onMinRange = (e) => {
    const n = Number(e.target.value);
    const cap = Math.min(maxVal, PRICE_SLIDER_MAX);
    setMinPrice(Math.min(n, cap));
  };

  const onMaxRange = (e) => {
    const n = Number(e.target.value);
    const floor = Math.max(minVal, 0);
    setMaxPrice(Math.max(n, floor));
  };

  const setStars = (n) => {
    setParams((p) => {
      if (n <= 0) p.delete("stars");
      else p.set("stars", String(n));
    });
  };

  const toggleStock = () => {
    setParams((p) => {
      if (p.get("stock") === "1") p.delete("stock");
      else p.set("stock", "1");
    });
  };

  const selectedCats = new Set(parsed.categoryIds);
  const starsValue = parsed.minRating ?? 0;

  return (
    <Aside>
      <Title>Фільтри</Title>
      <Section>
        <SectionLabel>Категорії</SectionLabel>
        {categories.map((c) => (
          <CheckRow key={c.id}>
            <input
              type="checkbox"
              checked={selectedCats.has(c.id)}
              onChange={() => toggleCategory(c.id)}
            />
            {c.name}
          </CheckRow>
        ))}
      </Section>
      <Section>
        <SectionLabel>Діапазон цін</SectionLabel>
        <RangeRow>
          <RangeLabels>
            <span>Від: ${minVal}</span>
            <span>
              До: $
              {maxVal >= PRICE_SLIDER_MAX ? `${PRICE_SLIDER_MAX}+` : maxVal}
            </span>
          </RangeLabels>
          <input
            type="range"
            min={0}
            max={PRICE_SLIDER_MAX}
            value={Math.min(minVal, maxVal)}
            onChange={onMinRange}
            aria-label="Мінімальна ціна"
          />
          <input
            type="range"
            min={0}
            max={PRICE_SLIDER_MAX}
            value={Math.max(minVal, maxVal)}
            onChange={onMaxRange}
            aria-label="Максимальна ціна"
          />
        </RangeRow>
      </Section>
      <Section>
        <SectionLabel>Мінімальний рейтинг</SectionLabel>
        <StarsSelect
          value={starsValue}
          onChange={(e) => setStars(Number(e.target.value))}
          aria-label="Мінімальний рейтинг зірок"
        >
          <option value={0}>Будь-який</option>
          <option value={1}>1+ зірок</option>
          <option value={2}>2+ зірок</option>
          <option value={3}>3+ зірок</option>
          <option value={4}>4+ зірок</option>
          <option value={5}>5 зірок</option>
        </StarsSelect>
      </Section>
      <Section>
        <StockRow>
          <input
            type="checkbox"
            checked={parsed.inStockOnly}
            onChange={toggleStock}
          />
          Лише в наявності
        </StockRow>
      </Section>
    </Aside>
  );
}
