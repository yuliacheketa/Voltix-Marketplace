import "dotenv/config";
import { randomBytes } from "crypto";
import {
  NotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  PrismaClient,
  ProductStatus,
  Role,
  SellerOrderStatus,
  SellerStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { createOrderWithSellerOrders } from "../src/modules/order/order.service";
import { getMockProductPairUrls } from "./productDemoImages";

const TARGET_USER_ID = "dcbd9b93-6672-431c-8504-0ef2c39c0f77";
const TARGET_USER_EMAIL = "cheketa.yuliia@gmail.com";
const TARGET_SHOP_DISPLAY_NAME = "Студія Voltix";
const TARGET_SHOP_DESCRIPTION =
  "Курований добір товарів для дому та гаджетів — затишний демо-магазин на платформі Voltix.";
const prisma = new PrismaClient();
const SALT = 10;

function d(value: string | number) {
  return new Prisma.Decimal(String(value));
}

function slugPart() {
  return randomBytes(3).toString("hex");
}

async function ensureCategoryTree() {
  const count = await prisma.category.count();
  if (count > 0) return;

  const catElectronics = await prisma.category.create({
    data: {
      name: "Електроніка",
      slug: "electronics",
      description: "Електронні пристрої",
      position: 0,
    },
  });
  const catClothing = await prisma.category.create({
    data: {
      name: "Одяг",
      slug: "clothing",
      description: "Одяг та взуття",
      position: 1,
    },
  });
  const catHome = await prisma.category.create({
    data: {
      name: "Дім",
      slug: "home",
      description: "Товари для дому",
      position: 2,
    },
  });
  const catSports = await prisma.category.create({
    data: {
      name: "Спорт",
      slug: "sports",
      description: "Спортивне обладнання",
      position: 3,
    },
  });

  const children = [
    {
      name: "Ноутбуки",
      slug: "laptops",
      parentId: catElectronics.id,
      position: 0,
    },
    {
      name: "Смартфони",
      slug: "smartphones",
      parentId: catElectronics.id,
      position: 1,
    },
    {
      name: "Планшети",
      slug: "tablets",
      parentId: catElectronics.id,
      position: 2,
    },
    {
      name: "Навушники",
      slug: "headphones",
      parentId: catElectronics.id,
      position: 3,
    },
    { name: "Чоловікам", slug: "men", parentId: catClothing.id, position: 0 },
    { name: "Жінкам", slug: "women", parentId: catClothing.id, position: 1 },
    { name: "Дітям", slug: "kids", parentId: catClothing.id, position: 2 },
    { name: "Меблі", slug: "furniture", parentId: catHome.id, position: 0 },
    { name: "Кухня", slug: "kitchen", parentId: catHome.id, position: 1 },
    { name: "Декор", slug: "decor", parentId: catHome.id, position: 2 },
    { name: "Фітнес", slug: "fitness", parentId: catSports.id, position: 0 },
    {
      name: "На природі",
      slug: "outdoor",
      parentId: catSports.id,
      position: 1,
    },
    {
      name: "Командні види спорту",
      slug: "team-sports",
      parentId: catSports.id,
      position: 2,
    },
  ];
  for (const c of children) {
    await prisma.category.create({ data: c });
  }
}

async function ensureTargetSellerProfileId(): Promise<string> {
  let user = await prisma.user.findUnique({
    where: { id: TARGET_USER_ID },
    include: { sellerProfile: true },
  });

  const allowAutoCreateTarget =
    process.env.MOCK_SEED_ENSURE_TARGET_USER === "1" ||
    process.env.NODE_ENV !== "production";

  if (!user && allowAutoCreateTarget) {
    const pass = process.env.MOCK_SEED_TARGET_PASSWORD ?? "Password123";
    const passwordHash = await bcrypt.hash(pass, SALT);
    await prisma.user.upsert({
      where: { id: TARGET_USER_ID },
      create: {
        id: TARGET_USER_ID,
        email: TARGET_USER_EMAIL,
        passwordHash,
        name: "Dev Target Seller",
        role: Role.SELLER,
        isVerified: true,
        emailVerificationToken: null,
      },
      update: {
        role: Role.SELLER,
        email: TARGET_USER_EMAIL,
      },
    });
    await prisma.cart.upsert({
      where: { userId: TARGET_USER_ID },
      create: { userId: TARGET_USER_ID },
      update: {},
    });
    user = await prisma.user.findUnique({
      where: { id: TARGET_USER_ID },
      include: { sellerProfile: true },
    });
  }

  if (!user) {
    console.error(
      "Користувача з TARGET_USER_ID не знайдено. У production запустіть з MOCK_SEED_ENSURE_TARGET_USER=1 або створіть запис вручну."
    );
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: TARGET_USER_ID },
    data: { email: TARGET_USER_EMAIL },
  });

  if (!user.sellerProfile) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: Role.SELLER },
    });
    let shopName = TARGET_SHOP_DISPLAY_NAME;
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        await prisma.sellerProfile.create({
          data: {
            userId: user.id,
            shopName,
            description: TARGET_SHOP_DESCRIPTION,
            status: SellerStatus.ACTIVE,
          },
        });
        break;
      } catch {
        shopName = `${TARGET_SHOP_DISPLAY_NAME} · ${slugPart()}`;
      }
    }
  }

  let profile = await prisma.sellerProfile.findUniqueOrThrow({
    where: { userId: user.id },
  });

  if (profile.shopName.startsWith("MockTarget-")) {
    let nextName = TARGET_SHOP_DISPLAY_NAME;
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        profile = await prisma.sellerProfile.update({
          where: { id: profile.id },
          data: {
            shopName: nextName,
            description: TARGET_SHOP_DESCRIPTION,
          },
        });
        break;
      } catch {
        nextName = `${TARGET_SHOP_DISPLAY_NAME} · ${slugPart()}`;
      }
    }
  }

  return profile.id;
}

const TARGET_PRODUCT_NAMES: { name: string; base: string }[] = [
  { name: "Ultra Noise Cancelling Headphones", base: "249.99" },
  { name: 'Studio Reference Monitor 27"', base: "429" },
  { name: "Mechanical Keyboard RGB", base: "119.5" },
  { name: "Wireless Ergonomic Mouse", base: "79.99" },
  { name: "USB-C Hub 7-in-1", base: "45" },
  { name: "Portable SSD 1TB", base: "139" },
  { name: "Webcam 4K Pro", base: "199" },
  { name: "Ring Light Streaming Kit", base: "65" },
  { name: "Smart Watch Series M", base: "299" },
  { name: "Fitness Tracker Band", base: "89" },
  { name: "Bluetooth Speaker Outdoor", base: "129" },
  { name: "True Wireless Earbuds", base: "159" },
  { name: "Gaming Chair Ergo", base: "349" },
  { name: "Standing Desk Frame", base: "499" },
  { name: "LED Desk Lamp Touch", base: "42" },
  { name: "Cotton Crew Socks 6-Pack", base: "24" },
  { name: "Merino Wool Sweater", base: "98" },
  { name: "Slim Fit Chinos", base: "74" },
  { name: "Running Shorts Pro", base: "48" },
  { name: "Winter Parka Insulated", base: "220" },
  { name: "Ceramic Cookware Set", base: "189" },
  { name: "Stainless Steel Kettle", base: "55" },
  { name: "Bamboo Cutting Board XL", base: "36" },
  { name: "Throw Pillow Set", base: "62" },
  { name: "Area Rug Modern 5x7", base: "280" },
  { name: "Yoga Block Pair", base: "22" },
  { name: "Resistance Bands Kit", base: "34" },
  { name: "Dumbbell Set Adjustable", base: "310" },
  { name: "Camping Tent 4P", base: "420" },
  { name: "Hiking Backpack 40L", base: "145" },
  { name: "Basketball Official Size", base: "29" },
  { name: "Tennis Racket Carbon", base: "175" },
  { name: "Cycling Helmet MIPS", base: "95" },
  { name: "Foam Roller Massage", base: "28" },
  { name: "Smart Plug WiFi 4-Pack", base: "49" },
  { name: "Air Purifier Compact", base: "189" },
  { name: "Robot Vacuum Lite", base: "399" },
  { name: "Electric Kettle Glass", base: "59" },
  { name: "French Press Coffee", base: "32" },
  { name: "Insulated Bottle 1L", base: "38" },
  { name: "Travel Adapter Universal", base: "27" },
  { name: "Laptop Stand Aluminum", base: "44" },
  { name: "Monitor Arm Single", base: "99" },
  { name: "Cable Management Box", base: "19" },
  { name: "Desk Mat Extended", base: "35" },
];

const STATUS_CYCLE: ProductStatus[] = [
  ProductStatus.ACTIVE,
  ProductStatus.ACTIVE,
  ProductStatus.ACTIVE,
  ProductStatus.PENDING,
  ProductStatus.DRAFT,
  ProductStatus.ACTIVE,
  ProductStatus.ARCHIVED,
  ProductStatus.REJECTED,
  ProductStatus.ACTIVE,
  ProductStatus.PENDING,
];

async function seedTargetProducts(sellerProfileId: string) {
  const existing = await prisma.product.count({
    where: {
      sellerId: sellerProfileId,
      slug: { startsWith: "mock-target-" },
    },
  });
  if (existing >= 30) {
    console.log(
      `[seed-mock] target products already present (${existing}), skip`
    );
    return;
  }

  const leafCats = await prisma.category.findMany({
    where: { parentId: { not: null }, isActive: true },
    select: { id: true },
  });
  if (leafCats.length === 0) {
    console.error("[seed-mock] no leaf categories");
    process.exit(1);
  }

  let idx = 0;
  for (const def of TARGET_PRODUCT_NAMES) {
    const categoryId = leafCats[idx % leafCats.length].id;
    const status = STATUS_CYCLE[idx % STATUS_CYCLE.length];
    const slug = `mock-target-${idx}-${slugPart()}`;
    const basePrice = d(def.base);
    const p = await prisma.product.create({
      data: {
        sellerId: sellerProfileId,
        categoryId,
        name: def.name,
        slug,
        description: `Mock listing: ${def.name}. Generated for dashboard statistics and catalog fill.`,
        basePrice,
        status,
        moderationNote:
          status === ProductStatus.REJECTED ? "Mock rejection note" : null,
      },
    });

    const [imgA, imgB] = getMockProductPairUrls(def.name);
    await prisma.productImage.createMany({
      data: [
        {
          productId: p.id,
          url: imgA,
          altText: `${def.name} main`,
          isMain: true,
          position: 0,
        },
        {
          productId: p.id,
          url: imgB,
          altText: `${def.name} alt`,
          isMain: false,
          position: 1,
        },
      ],
    });

    await prisma.productAttribute.createMany({
      data: [
        { productId: p.id, name: "Series", value: `MT-${idx + 1}` },
        { productId: p.id, name: "Warranty", value: "12 months" },
      ],
    });

    const v1 = d(Number(def.base) + 5);
    const v2 = d(Math.max(9.99, Number(def.base) - 3));
    await prisma.productVariant.createMany({
      data: [
        {
          productId: p.id,
          name: "Option",
          value: "Standard",
          price: v1,
          stock: 20 + (idx % 40),
          sku: `MT-${slug.slice(-6)}-std`,
        },
        {
          productId: p.id,
          name: "Option",
          value: "Plus",
          price: v2,
          stock: 10 + (idx % 25),
          sku: `MT-${slug.slice(-6)}-plus`,
        },
      ],
    });

    idx += 1;
  }
  console.log(
    `[seed-mock] created ${TARGET_PRODUCT_NAMES.length} target seller products`
  );
}

async function seedBulkOrdersReviewsNotifications() {
  const bulkCount = await prisma.order.count({
    where: { note: { startsWith: "seed-mock-bulk-" } },
  });
  if (bulkCount >= 20) {
    console.log(
      `[seed-mock] bulk orders already present (${bulkCount}), skip bulk`
    );
    return;
  }

  const customers = await prisma.user.findMany({
    where: { role: Role.CUSTOMER },
    include: {
      addresses: { take: 1, orderBy: { createdAt: "asc" } },
    },
    take: 8,
  });
  const withAddr = customers.filter((c) => c.addresses[0]);
  if (withAddr.length === 0) {
    console.log("[seed-mock] no customers with addresses, skip bulk orders");
    return;
  }

  const variants = await prisma.productVariant.findMany({
    where: {
      product: {
        status: ProductStatus.ACTIVE,
        seller: { status: SellerStatus.ACTIVE },
      },
    },
    select: { id: true },
    take: 120,
  });
  if (variants.length < 2) {
    console.log("[seed-mock] not enough variants for bulk orders");
    return;
  }

  const batch = `seed-mock-bulk-${Date.now()}`;
  const orderStatuses: OrderStatus[] = [
    OrderStatus.DELIVERED,
    OrderStatus.PAID,
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
  ];
  const sellerOrderMap: Record<OrderStatus, SellerOrderStatus> = {
    [OrderStatus.DELIVERED]: SellerOrderStatus.DELIVERED,
    [OrderStatus.PAID]: SellerOrderStatus.PENDING,
    [OrderStatus.PENDING]: SellerOrderStatus.PENDING,
    [OrderStatus.PROCESSING]: SellerOrderStatus.PROCESSING,
    [OrderStatus.SHIPPED]: SellerOrderStatus.SHIPPED,
    [OrderStatus.CANCELLED]: SellerOrderStatus.CANCELLED,
    [OrderStatus.REFUNDED]: SellerOrderStatus.REFUNDED,
  };

  const createdOrderIds: string[] = [];
  for (let i = 0; i < 22; i++) {
    const cust = withAddr[i % withAddr.length];
    const addr = cust.addresses[0];
    const nLines = 1 + (i % 3);
    const lines: { variantId: string; quantity: number }[] = [];
    const used = new Set<string>();
    for (let j = 0; j < nLines; j++) {
      let pick = variants[(i * 7 + j * 11) % variants.length];
      let guard = 0;
      while (used.has(pick.id) && guard < 50) {
        pick = variants[(i + j + guard) % variants.length];
        guard++;
      }
      used.add(pick.id);
      lines.push({ variantId: pick.id, quantity: 1 + (i % 2) });
    }

    const oStatus = orderStatuses[i % orderStatuses.length];
    const soStatus = sellerOrderMap[oStatus] ?? SellerOrderStatus.PENDING;

    const order = await createOrderWithSellerOrders({
      userId: cust.id,
      addressId: addr.id,
      deliveryMethod: i % 2 === 0 ? "standard" : "express",
      deliveryCost: d(i % 3 === 0 ? "12.99" : "7.5"),
      lines,
      orderStatus: oStatus,
      sellerOrderStatus: soStatus,
      note: `${batch}-${i}`,
    });
    createdOrderIds.push(order.id);

    if (
      oStatus === OrderStatus.DELIVERED ||
      oStatus === OrderStatus.PAID ||
      oStatus === OrderStatus.PROCESSING ||
      oStatus === OrderStatus.SHIPPED
    ) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          method:
            i % 3 === 0 ? PaymentMethod.CARD : PaymentMethod.BANK_TRANSFER,
          status:
            oStatus === OrderStatus.DELIVERED || oStatus === OrderStatus.PAID
              ? PaymentStatus.COMPLETED
              : PaymentStatus.PENDING,
          transactionId: `mock_tx_${order.id.slice(0, 8)}`,
          paidAt:
            oStatus === OrderStatus.DELIVERED || oStatus === OrderStatus.PAID
              ? new Date()
              : null,
        },
      });
    }
  }

  let reviewN = 0;
  for (const oid of createdOrderIds) {
    const ord = await prisma.order.findUnique({
      where: { id: oid },
      include: { items: true },
    });
    if (!ord || ord.status !== OrderStatus.DELIVERED) continue;
    for (const it of ord.items) {
      const exists = await prisma.review.findUnique({
        where: { orderItemId: it.id },
      });
      if (exists) continue;
      const variant = await prisma.productVariant.findUnique({
        where: { id: it.variantId },
        select: { productId: true },
      });
      if (!variant) continue;
      await prisma.review.create({
        data: {
          productId: variant.productId,
          userId: ord.userId,
          orderItemId: it.id,
          rating: 3 + (reviewN % 3),
          title: `Mock review ${reviewN}`,
          body: "Seeded for statistics.",
          isVerified: true,
        },
      });
      reviewN++;
      if (reviewN >= 18) break;
    }
    if (reviewN >= 18) break;
  }

  const allUserIds = (
    await prisma.user.findMany({ select: { id: true }, take: 30 })
  ).map((u) => u.id);
  const notifTypes = Object.values(NotificationType);
  for (let k = 0; k < 40; k++) {
    const uid = allUserIds[k % allUserIds.length];
    await prisma.notification.create({
      data: {
        userId: uid,
        type: notifTypes[k % notifTypes.length],
        title: `Mock notification ${k}`,
        body: `Bulk seed-mock batch ${batch}`,
        isRead: k % 3 === 0,
      },
    });
  }

  console.log("[seed-mock] bulk orders, payments, reviews, notifications done");
}

async function main() {
  await ensureCategoryTree();
  const sellerProfileId = await ensureTargetSellerProfileId();
  await seedTargetProducts(sellerProfileId);
  await seedBulkOrdersReviewsNotifications();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
