import type { Product } from "@voltix/api-client";

export function collectRowKeys(products: Product[]): string[] {
  const keys = new Set<string>();
  keys.add("Price");
  keys.add("Rating");
  keys.add("In stock");
  for (const p of products) {
    Object.keys(p.attributes ?? {}).forEach((k) => keys.add(k));
  }
  return [...keys];
}

export function getCellDisplay(p: Product, rowKey: string): string {
  if (rowKey === "Price") {
    return `${p.price} ${p.currency}`;
  }
  if (rowKey === "Rating") {
    return p.rating != null ? String(p.rating) : "—";
  }
  if (rowKey === "In stock") {
    return p.inStock ? "Yes" : "No";
  }
  return p.attributes?.[rowKey] ?? "—";
}

export function parseNumericForRow(
  rowKey: string,
  p: Product,
  display: string
): number | null {
  if (rowKey === "Price") {
    return p.price;
  }
  if (rowKey === "Rating") {
    return p.rating ?? null;
  }
  if (rowKey === "In stock") {
    return p.inStock ? 1 : 0;
  }
  const cleaned = String(display).replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function higherIsBetter(rowKey: string): boolean {
  return !/price/i.test(rowKey);
}

export function parseAttrNumber(raw: string | undefined): number | null {
  if (raw == null || raw === "") {
    return null;
  }
  const cleaned = String(raw).replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function radarDimensions(products: Product[]): string[] {
  const dims: string[] = ["Price", "Rating"];
  const attrKeys = new Set<string>();
  for (const p of products) {
    for (const [k, v] of Object.entries(p.attributes ?? {})) {
      if (parseAttrNumber(v) != null) {
        attrKeys.add(k);
      }
    }
  }
  return [...dims, ...attrKeys];
}

export function rawMetric(p: Product, dim: string): number | null {
  if (dim === "Price") {
    return p.price;
  }
  if (dim === "Rating") {
    return p.rating ?? null;
  }
  return parseAttrNumber(p.attributes?.[dim]);
}

export function normalizeRow(values: number[]): number[] {
  const finite = values.filter((v) => Number.isFinite(v));
  if (!finite.length) {
    return values.map(() => 0);
  }
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  if (min === max) {
    return values.map((v) => (Number.isFinite(v) ? 50 : 0));
  }
  return values.map((v) =>
    Number.isFinite(v) ? ((v - min) / (max - min)) * 100 : 0
  );
}
