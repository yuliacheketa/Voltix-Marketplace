import { Prisma, ProductStatus, SellerStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";
import type { AddCartItemBody, PatchCartItemBody } from "./cart.validation";

async function ensureCartForUser(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      select: { id: true },
    });
  }
  return cart.id;
}

async function defaultVariantId(productId: string) {
  const v = await prisma.productVariant.findFirst({
    where: { productId },
    orderBy: { id: "asc" },
    select: { id: true },
  });
  if (!v) {
    throw new HttpError(400, "Product has no variants");
  }
  return v.id;
}

async function assertProductSellable(productId: string) {
  const p = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: { select: { status: true } } },
  });
  if (!p) {
    throw new HttpError(400, "Product not found");
  }
  if (p.status !== ProductStatus.ACTIVE) {
    throw new HttpError(400, "Product is not available");
  }
  if (p.seller.status !== SellerStatus.ACTIVE) {
    throw new HttpError(400, "Product is not available");
  }
  return p;
}

function serializeCartItem(
  row: {
    id: string;
    quantity: number;
    addedAt: Date;
    product: {
      id: string;
      name: string;
      slug: string;
      status: ProductStatus;
      seller: { status: SellerStatus };
      images: { url: string; isMain: boolean }[];
    };
    variant: {
      id: string;
      name: string;
      value: string;
      price: Prisma.Decimal;
      stock: number;
    } | null;
  },
  unavailable: boolean
) {
  const main =
    row.product.images.find((i) => i.isMain) ?? row.product.images[0];
  const base = {
    id: row.id,
    quantity: row.quantity,
    addedAt: row.addedAt,
    product: {
      id: row.product.id,
      name: row.product.name,
      slug: row.product.slug,
      mainImageUrl: main?.url ?? null,
    },
    variant: row.variant
      ? {
          id: row.variant.id,
          name: row.variant.name,
          value: row.variant.value,
          price: row.variant.price.toString(),
          stock: row.variant.stock,
        }
      : null,
  };
  if (unavailable) {
    return { ...base, unavailable: true as const };
  }
  return base;
}

export async function getCartForUser(userId: string) {
  const cartId = await ensureCartForUser(userId);
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    orderBy: { addedAt: "asc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          seller: { select: { status: true } },
          images: {
            select: { url: true, isMain: true },
            orderBy: { position: "asc" },
          },
        },
      },
      variant: {
        select: { id: true, name: true, value: true, price: true, stock: true },
      },
    },
  });
  let totalPrice = new Prisma.Decimal(0);
  let itemCount = 0;
  const out = items.map((it) => {
    itemCount += it.quantity;
    const unit = it.variant?.price ?? new Prisma.Decimal(0);
    totalPrice = totalPrice.plus(unit.times(it.quantity));
    const unavailable =
      it.product.status !== ProductStatus.ACTIVE ||
      it.product.seller.status !== SellerStatus.ACTIVE;
    return serializeCartItem(it, unavailable);
  });
  return {
    cart: {
      id: cartId,
      items: out,
      summary: {
        itemCount,
        totalPrice: totalPrice.toString(),
      },
    },
  };
}

export async function getCheckoutSummaryForUser(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              status: true,
              sellerId: true,
              seller: {
                select: {
                  id: true,
                  shopName: true,
                  logoUrl: true,
                  status: true,
                },
              },
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              value: true,
              price: true,
              stock: true,
            },
          },
        },
      },
    },
  });
  if (!cart || cart.items.length === 0) {
    return {
      sellerGroups: [] as Array<{
        seller: { id: string; shopName: string; logoUrl: string | null };
        items: Array<{
          productName: string;
          variantName: string;
          quantity: number;
          unitPrice: string;
          lineTotal: string;
        }>;
        subtotal: string;
      }>,
      cartSubtotal: "0",
      issues: [] as Array<{
        cartItemId: string;
        reason: "UNAVAILABLE" | "INSUFFICIENT_STOCK";
      }>,
    };
  }

  type ValidLine = {
    sellerId: string;
    seller: { id: string; shopName: string; logoUrl: string | null };
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    lineTotal: Prisma.Decimal;
  };

  const issues: Array<{
    cartItemId: string;
    reason: "UNAVAILABLE" | "INSUFFICIENT_STOCK";
  }> = [];
  const validLines: ValidLine[] = [];

  for (const it of cart.items) {
    const product = it.product;
    let variant = it.variant;
    if (!it.variantId || !variant) {
      const def = await prisma.productVariant.findFirst({
        where: { productId: it.productId },
        orderBy: { id: "asc" },
        select: {
          id: true,
          name: true,
          value: true,
          price: true,
          stock: true,
        },
      });
      if (!def) {
        issues.push({ cartItemId: it.id, reason: "UNAVAILABLE" });
        continue;
      }
      variant = def;
    }

    if (
      product.status !== ProductStatus.ACTIVE ||
      product.seller.status !== SellerStatus.ACTIVE
    ) {
      issues.push({ cartItemId: it.id, reason: "UNAVAILABLE" });
      continue;
    }

    if (it.quantity > variant.stock) {
      issues.push({ cartItemId: it.id, reason: "INSUFFICIENT_STOCK" });
      continue;
    }

    const unitPrice = new Prisma.Decimal(variant.price);
    const lineTotal = unitPrice.times(it.quantity);
    validLines.push({
      sellerId: product.sellerId,
      seller: {
        id: product.seller.id,
        shopName: product.seller.shopName,
        logoUrl: product.seller.logoUrl,
      },
      productName: product.name,
      variantName: `${variant.name}: ${variant.value}`,
      quantity: it.quantity,
      unitPrice,
      lineTotal,
    });
  }

  const bySeller = new Map<
    string,
    {
      seller: { id: string; shopName: string; logoUrl: string | null };
      items: Array<{
        productName: string;
        variantName: string;
        quantity: number;
        unitPrice: string;
        lineTotal: string;
      }>;
      subtotal: Prisma.Decimal;
    }
  >();

  let cartSubtotal = new Prisma.Decimal(0);
  for (const line of validLines) {
    cartSubtotal = cartSubtotal.plus(line.lineTotal);
    let g = bySeller.get(line.sellerId);
    if (!g) {
      g = {
        seller: line.seller,
        items: [],
        subtotal: new Prisma.Decimal(0),
      };
      bySeller.set(line.sellerId, g);
    }
    g.items.push({
      productName: line.productName,
      variantName: line.variantName,
      quantity: line.quantity,
      unitPrice: line.unitPrice.toString(),
      lineTotal: line.lineTotal.toString(),
    });
    g.subtotal = g.subtotal.plus(line.lineTotal);
  }

  const sellerGroups = [...bySeller.values()].map((g) => ({
    seller: g.seller,
    items: g.items,
    subtotal: g.subtotal.toString(),
  }));

  return {
    sellerGroups,
    cartSubtotal: cartSubtotal.toString(),
    issues,
  };
}

export async function addCartItem(userId: string, body: AddCartItemBody) {
  await assertProductSellable(body.productId);
  const variantId = body.variantId ?? (await defaultVariantId(body.productId));
  const v = await prisma.productVariant.findFirst({
    where: { id: variantId, productId: body.productId },
  });
  if (!v) {
    throw new HttpError(400, "Invalid variant for product");
  }
  const cartId = await ensureCartForUser(userId);
  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId,
      productId: body.productId,
      variantId,
    },
  });
  if (existing) {
    const desired = existing.quantity + body.quantity;
    const finalQty = Math.min(desired, v.stock);
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: finalQty },
    });
  } else {
    if (body.quantity > v.stock) {
      throw new HttpError(400, "Not enough stock", {
        success: false,
        errors: [{ message: "Not enough stock" }],
      });
    }
    await prisma.cartItem.create({
      data: {
        cartId,
        productId: body.productId,
        variantId,
        quantity: body.quantity,
      },
    });
  }
  return getCartForUser(userId);
}

export async function patchCartItem(
  userId: string,
  cartItemId: string,
  body: PatchCartItemBody
) {
  const cartId = await ensureCartForUser(userId);
  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cartId },
    include: {
      variant: { select: { stock: true } },
    },
  });
  if (!item || !item.variantId || !item.variant) {
    throw new HttpError(404, "Not found");
  }
  if (body.quantity > item.variant.stock) {
    throw new HttpError(400, "Not enough stock", {
      success: false,
      errors: [{ message: "Not enough stock" }],
    });
  }
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: body.quantity },
  });
  return getCartForUser(userId);
}

export async function removeCartItem(userId: string, cartItemId: string) {
  const cartId = await ensureCartForUser(userId);
  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cartId },
  });
  if (!item) {
    throw new HttpError(404, "Not found");
  }
  await prisma.cartItem.delete({ where: { id: cartItemId } });
  return getCartForUser(userId);
}

export async function clearCart(userId: string) {
  const cartId = await ensureCartForUser(userId);
  await prisma.cartItem.deleteMany({ where: { cartId } });
  return getCartForUser(userId);
}
