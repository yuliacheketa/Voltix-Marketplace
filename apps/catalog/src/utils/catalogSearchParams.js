const SORT_VALUES = new Set(["price_asc", "price_desc", "rating", "newest"]);

export const PRICE_SLIDER_MAX = 5000;

export function parseCatalogSearchParams(searchParams) {
  const q = searchParams.get("q")?.trim() ?? "";
  const categoryIds = searchParams.getAll("cat").filter(Boolean);
  const minRaw = searchParams.get("min");
  const maxRaw = searchParams.get("max");
  const minPrice =
    minRaw != null && minRaw !== "" && !Number.isNaN(Number(minRaw))
      ? Number(minRaw)
      : undefined;
  const maxPrice =
    maxRaw != null && maxRaw !== "" && !Number.isNaN(Number(maxRaw))
      ? Number(maxRaw)
      : undefined;
  const starsRaw = searchParams.get("stars");
  const minRating =
    starsRaw != null &&
    starsRaw !== "" &&
    !Number.isNaN(Number(starsRaw)) &&
    Number(starsRaw) > 0
      ? Number(starsRaw)
      : undefined;
  const stock = searchParams.get("stock");
  const inStockOnly = stock === "1" || stock === "true";
  const sortRaw = searchParams.get("sort");
  const sort = SORT_VALUES.has(sortRaw) ? sortRaw : "newest";
  return {
    q,
    categoryIds,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    sort,
  };
}

export function buildProductFilters(parsed, offset, limit) {
  const filters = {
    search: parsed.q || undefined,
    categoryIds: parsed.categoryIds.length > 0 ? parsed.categoryIds : undefined,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    minRating: parsed.minRating,
    inStockOnly: parsed.inStockOnly ? true : undefined,
    sort: parsed.sort,
    limit,
    offset,
  };
  return filters;
}

export function filtersSignature(searchParams) {
  return searchParams.toString();
}
