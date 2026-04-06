import type {
  Category,
  CreateOrderPayload,
  Order,
  Product,
  ProductFilters,
  ProductReview,
  ProductSort,
} from "./types.js";

const BASE = "https://dummyjson.com";

type DummyReview = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
};

type DummyProduct = {
  id: number;
  title: string;
  description?: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  brand?: string;
  sku?: string;
  weight?: number;
  thumbnail?: string;
  images?: string[];
  reviews?: DummyReview[];
  meta?: { createdAt?: string };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
};

type ListResponse = {
  products: DummyProduct[];
  total?: number;
  skip?: number;
  limit?: number;
};

function mapReviews(d: DummyProduct): ProductReview[] | undefined {
  if (!d.reviews?.length) return undefined;
  return d.reviews.map((r, i) => ({
    id: `${d.id}-r-${i}`,
    author: r.reviewerName,
    rating: r.rating,
    text: r.comment,
    createdAt: r.date,
  }));
}

function mapDummyProduct(d: DummyProduct): Product {
  const attrs: Record<string, string> = {
    Category: d.category,
  };
  if (d.brand) attrs.Brand = d.brand;
  if (d.sku) attrs.SKU = d.sku;
  if (d.weight != null) attrs.Weight = String(d.weight);
  if (d.warrantyInformation) attrs.Warranty = d.warrantyInformation;
  if (d.shippingInformation) attrs.Shipping = d.shippingInformation;
  if (d.availabilityStatus) attrs.Availability = d.availabilityStatus;

  return {
    id: String(d.id),
    title: d.title,
    description: d.description,
    price: d.price,
    currency: "USD",
    categoryId: d.category,
    imageUrl: d.thumbnail,
    imageUrls: d.images,
    rating: d.rating,
    inStock: d.stock > 0,
    createdAt: d.meta?.createdAt,
    attributes: attrs,
    reviews: mapReviews(d),
  };
}

function sortProducts(list: Product[], sort?: ProductSort): Product[] {
  const out = [...list];
  if (sort === "price_asc") out.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") out.sort((a, b) => b.price - a.price);
  else if (sort === "rating")
    out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  else if (sort === "newest")
    out.sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    );
  return out;
}

function applyFilters(products: Product[], f?: ProductFilters): Product[] {
  if (!f) return products;
  let out = products;
  if (f.minPrice != null) {
    out = out.filter((p) => p.price >= f.minPrice!);
  }
  if (f.maxPrice != null) {
    out = out.filter((p) => p.price <= f.maxPrice!);
  }
  if (f.minRating != null) {
    out = out.filter((p) => (p.rating ?? 0) >= f.minRating!);
  }
  if (f.inStockOnly) {
    out = out.filter((p) => p.inStock !== false);
  }
  if (f.categoryIds && f.categoryIds.length > 0) {
    const set = new Set(f.categoryIds);
    out = out.filter((p) => p.categoryId && set.has(p.categoryId));
  }
  return out;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`DummyJSON ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function getProducts(
  filters?: ProductFilters
): Promise<Product[]> {
  const limit = filters?.limit ?? 12;
  const offset = filters?.offset ?? 0;
  const need = offset + limit;

  let raw: DummyProduct[] = [];

  if (filters?.search?.trim()) {
    const j = await fetchJson<ListResponse>(
      `/products/search?q=${encodeURIComponent(filters.search.trim())}&limit=100&skip=0`
    );
    raw = j.products ?? [];
  } else {
    const singleCat =
      filters?.categoryIds?.length === 1
        ? filters.categoryIds[0]
        : filters?.categoryId;
    if (singleCat) {
      const j = await fetchJson<ListResponse>(
        `/products/category/${encodeURIComponent(singleCat)}?limit=100&skip=0`
      );
      raw = j.products ?? [];
    } else {
      let skip = 0;
      const batch = 100;
      while (raw.length < need && skip < 300) {
        const j = await fetchJson<ListResponse>(
          `/products?limit=${batch}&skip=${skip}`
        );
        const chunk = j.products ?? [];
        raw.push(...chunk);
        if (chunk.length < batch) break;
        skip += batch;
      }
    }
  }

  let mapped = raw.map(mapDummyProduct);
  mapped = applyFilters(mapped, filters);
  mapped = sortProducts(mapped, filters?.sort);
  return mapped.slice(offset, offset + limit);
}

export async function getProductById(id: string): Promise<Product> {
  const d = await fetchJson<DummyProduct>(
    `/products/${encodeURIComponent(id)}`
  );
  return mapDummyProduct(d);
}

type DummyCategory = { slug: string; name: string };

export async function getCategories(): Promise<Category[]> {
  const list = await fetchJson<DummyCategory[]>("/products/categories");
  return list.map((c) => ({
    id: c.slug,
    name: c.name,
    slug: c.slug,
  }));
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const total = payload.items.reduce(
    (s, i) => s + (i.unitPrice ?? 0) * i.quantity,
    0
  );
  return {
    id: `demo-${Date.now()}`,
    items: payload.items,
    total,
    currency: payload.currency,
    status: "demo",
    createdAt: new Date().toISOString(),
  };
}
