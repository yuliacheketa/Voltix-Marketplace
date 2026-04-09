import { Prisma, ProductStatus, SellerStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";

const UUID_PARAM_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function looksLikeProductUuid(param: string): boolean {
  return UUID_PARAM_RE.test(param.trim());
}

export type CatalogProductsQuery = {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy: "price_asc" | "price_desc" | "rating" | "newest";
};

export async function listCatalogProducts(q: CatalogProductsQuery) {
  const skip = (q.page - 1) * q.limit;
  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    seller: { status: SellerStatus.ACTIVE },
    ...(q.search
      ? {
          name: { contains: q.search, mode: "insensitive" as const },
        }
      : {}),
    ...(q.categoryId ? { categoryId: q.categoryId } : {}),
    ...(q.minPrice != null || q.maxPrice != null
      ? {
          basePrice: {
            ...(q.minPrice != null
              ? { gte: new Prisma.Decimal(q.minPrice) }
              : {}),
            ...(q.maxPrice != null
              ? { lte: new Prisma.Decimal(q.maxPrice) }
              : {}),
          },
        }
      : {}),
    ...(q.rating != null ? { rating: { gte: q.rating } } : {}),
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (q.sortBy === "price_asc") orderBy = { basePrice: "asc" };
  if (q.sortBy === "price_desc") orderBy = { basePrice: "desc" };
  if (q.sortBy === "rating") orderBy = { rating: "desc" };
  if (q.sortBy === "newest") orderBy = { createdAt: "desc" };

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: q.limit,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        rating: true,
        reviewCount: true,
        totalSold: true,
        createdAt: true,
        category: { select: { name: true } },
        seller: { select: { shopName: true } },
        images: {
          where: { isMain: true },
          take: 1,
          select: { url: true },
        },
      },
    }),
  ]);

  const products = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice.toString(),
    rating: p.rating,
    reviewCount: p.reviewCount,
    totalSold: p.totalSold,
    createdAt: p.createdAt,
    mainImageUrl: p.images[0]?.url ?? null,
    categoryName: p.category.name,
    sellerShopName: p.seller.shopName,
  }));

  const totalPages = total === 0 ? 0 : Math.ceil(total / q.limit);
  return {
    products,
    pagination: { page: q.page, limit: q.limit, total, totalPages },
  };
}

export async function getCatalogProductBySlug(slug: string) {
  const key = slug.trim();
  const include = {
    seller: {
      select: {
        shopName: true,
        description: true,
        logoUrl: true,
        rating: true,
        totalSales: true,
        isVerified: true,
        status: true,
      },
    },
    category: { select: { name: true, slug: true } },
    images: { orderBy: { position: "asc" as const } },
    attributes: true,
    variants: {
      select: {
        id: true,
        name: true,
        value: true,
        price: true,
        stock: true,
      },
    },
  };

  let p = null;
  if (looksLikeProductUuid(key)) {
    p = await prisma.product.findUnique({
      where: { id: key },
      include,
    });
  }
  if (!p) {
    p = await prisma.product.findUnique({
      where: { slug: key },
      include,
    });
  }
  if (
    !p ||
    p.status !== ProductStatus.ACTIVE ||
    p.seller.status !== SellerStatus.ACTIVE
  ) {
    throw new HttpError(404, "Not found");
  }
  return {
    id: p.id,
    sellerId: p.sellerId,
    categoryId: p.categoryId,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: p.basePrice.toString(),
    status: p.status,
    moderationNote: p.moderationNote,
    rating: p.rating,
    reviewCount: p.reviewCount,
    totalSold: p.totalSold,
    isFeatured: p.isFeatured,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    images: p.images.map((i) => ({
      id: i.id,
      url: i.url,
      altText: i.altText,
      isMain: i.isMain,
      position: i.position,
    })),
    attributes: p.attributes.map((a) => ({
      id: a.id,
      name: a.name,
      value: a.value,
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      price: v.price.toString(),
      stock: v.stock,
    })),
    seller: {
      shopName: p.seller.shopName,
      description: p.seller.description,
      logoUrl: p.seller.logoUrl,
      rating: p.seller.rating,
      totalSales: p.seller.totalSales,
      isVerified: p.seller.isVerified,
    },
    category: p.category,
  };
}

export async function listCategoryTree() {
  const roots = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { position: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { position: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });
  return roots.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    children: c.children,
  }));
}

export async function getCategoryBySlug(slug: string) {
  const c = await prisma.category.findFirst({
    where: { slug, parentId: null, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { position: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });
  if (!c) {
    throw new HttpError(404, "Not found");
  }
  const productCount = await prisma.product.count({
    where: {
      categoryId: { in: [c.id, ...c.children.map((ch) => ch.id)] },
      status: ProductStatus.ACTIVE,
      seller: { status: SellerStatus.ACTIVE },
    },
  });
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    children: c.children,
    productCount,
  };
}

export async function listProductReviews(
  productSlug: string,
  page: number,
  limit: number
) {
  const key = productSlug.trim();
  let p = null;
  if (looksLikeProductUuid(key)) {
    p = await prisma.product.findUnique({
      where: { id: key },
      select: { id: true },
    });
  }
  if (!p) {
    p = await prisma.product.findUnique({
      where: { slug: key },
      select: { id: true },
    });
  }
  if (!p) {
    throw new HttpError(404, "Not found");
  }
  const skip = (page - 1) * limit;
  const where = { productId: p.id };
  const [total, rows] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        isVerified: true,
        createdAt: true,
        user: { select: { name: true, avatarUrl: true } },
      },
    }),
  ]);
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    reviews: rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      isVerified: r.isVerified,
      createdAt: r.createdAt,
      user: { name: r.user.name, avatarUrl: r.user.avatarUrl },
    })),
    pagination: { page, limit, total, totalPages },
  };
}
