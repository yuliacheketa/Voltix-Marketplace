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
import { getSeedProductTripleUrls } from "./productDemoImages";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const notificationTypes: NotificationType[] = [
  NotificationType.ORDER_STATUS_CHANGED,
  NotificationType.NEW_REVIEW,
  NotificationType.PRODUCT_APPROVED,
  NotificationType.PRODUCT_REJECTED,
  NotificationType.SELLER_APPROVED,
  NotificationType.SELLER_SUSPENDED,
  NotificationType.LOW_STOCK,
  NotificationType.NEW_ORDER,
];

async function hash(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function d(value: string | number) {
  return new Prisma.Decimal(String(value));
}

async function main() {
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.sellerOrder.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany({
    where: { parentId: { not: null } },
  });
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await hash("Admin123");
  const defaultPass = await hash("Password123");

  const admin = await prisma.user.create({
    data: {
      email: "admin@voltix.com",
      passwordHash: adminPass,
      name: "Admin User",
      role: Role.ADMIN,
      isVerified: true,
      emailVerificationToken: null,
    },
  });

  const moderator = await prisma.user.create({
    data: {
      email: "moderator@voltix.com",
      passwordHash: defaultPass,
      name: "Moderator User",
      role: Role.MODERATOR,
      isVerified: true,
      emailVerificationToken: null,
    },
  });

  const sellerUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "seller1@voltix.com",
        passwordHash: defaultPass,
        name: "Seller One",
        role: Role.SELLER,
        isVerified: true,
        emailVerificationToken: null,
      },
    }),
    prisma.user.create({
      data: {
        email: "seller2@voltix.com",
        passwordHash: defaultPass,
        name: "Seller Two",
        role: Role.SELLER,
        isVerified: true,
        emailVerificationToken: null,
      },
    }),
    prisma.user.create({
      data: {
        email: "seller3@voltix.com",
        passwordHash: defaultPass,
        name: "Seller Three",
        role: Role.SELLER,
        isVerified: true,
        emailVerificationToken: null,
      },
    }),
  ]);

  const customers = await Promise.all(
    [1, 2, 3, 4, 5].map((n) =>
      prisma.user.create({
        data: {
          email: `customer${n}@voltix.com`,
          passwordHash: defaultPass,
          name: `Customer ${n}`,
          role: Role.CUSTOMER,
          isVerified: true,
          emailVerificationToken: null,
        },
      })
    )
  );

  const sellers = await Promise.all([
    prisma.sellerProfile.create({
      data: {
        userId: sellerUsers[0].id,
        shopName: "TechVault",
        description: "Electronics and gadgets",
        status: SellerStatus.ACTIVE,
      },
    }),
    prisma.sellerProfile.create({
      data: {
        userId: sellerUsers[1].id,
        shopName: "StyleHub",
        description: "Fashion and apparel",
        status: SellerStatus.ACTIVE,
      },
    }),
    prisma.sellerProfile.create({
      data: {
        userId: sellerUsers[2].id,
        shopName: "HomeNest",
        description: "Home and living",
        status: SellerStatus.ACTIVE,
      },
    }),
  ]);

  const catElectronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices",
      position: 0,
    },
  });
  const catClothing = await prisma.category.create({
    data: {
      name: "Clothing",
      slug: "clothing",
      description: "Apparel",
      position: 1,
    },
  });
  const catHome = await prisma.category.create({
    data: {
      name: "Home",
      slug: "home",
      description: "Home goods",
      position: 2,
    },
  });
  const catSports = await prisma.category.create({
    data: {
      name: "Sports",
      slug: "sports",
      description: "Sports equipment",
      position: 3,
    },
  });

  const catLaptops = await prisma.category.create({
    data: {
      name: "Laptops",
      slug: "laptops",
      parentId: catElectronics.id,
      position: 0,
    },
  });
  const catSmartphones = await prisma.category.create({
    data: {
      name: "Smartphones",
      slug: "smartphones",
      parentId: catElectronics.id,
      position: 1,
    },
  });
  await prisma.category.create({
    data: {
      name: "Tablets",
      slug: "tablets",
      parentId: catElectronics.id,
      position: 2,
    },
  });
  await prisma.category.create({
    data: {
      name: "Headphones",
      slug: "headphones",
      parentId: catElectronics.id,
      position: 3,
    },
  });
  await prisma.category.create({
    data: {
      name: "Men",
      slug: "men",
      parentId: catClothing.id,
      position: 0,
    },
  });
  await prisma.category.create({
    data: {
      name: "Women",
      slug: "women",
      parentId: catClothing.id,
      position: 1,
    },
  });
  await prisma.category.create({
    data: {
      name: "Kids",
      slug: "kids",
      parentId: catClothing.id,
      position: 2,
    },
  });
  await prisma.category.create({
    data: {
      name: "Furniture",
      slug: "furniture",
      parentId: catHome.id,
      position: 0,
    },
  });
  await prisma.category.create({
    data: {
      name: "Kitchen",
      slug: "kitchen",
      parentId: catHome.id,
      position: 1,
    },
  });
  await prisma.category.create({
    data: {
      name: "Decor",
      slug: "decor",
      parentId: catHome.id,
      position: 2,
    },
  });
  await prisma.category.create({
    data: {
      name: "Fitness",
      slug: "fitness",
      parentId: catSports.id,
      position: 0,
    },
  });
  await prisma.category.create({
    data: {
      name: "Outdoor",
      slug: "outdoor",
      parentId: catSports.id,
      position: 1,
    },
  });
  await prisma.category.create({
    data: {
      name: "Team Sports",
      slug: "team-sports",
      parentId: catSports.id,
      position: 2,
    },
  });

  const productDefs = [
    {
      sellerIdx: 0,
      categoryId: catLaptops.id,
      name: "ProBook 14",
      slug: "probook-14",
      base: "1299.00",
    },
    {
      sellerIdx: 0,
      categoryId: catLaptops.id,
      name: "AirLite 13",
      slug: "airlite-13",
      base: "999.00",
    },
    {
      sellerIdx: 0,
      categoryId: catSmartphones.id,
      name: "PixelPhone X",
      slug: "pixelphone-x",
      base: "799.00",
    },
    {
      sellerIdx: 1,
      categoryId: catSmartphones.id,
      name: "Nova Phone",
      slug: "nova-phone",
      base: "649.00",
    },
    {
      sellerIdx: 1,
      categoryId: catClothing.id,
      name: "Classic Denim Jacket",
      slug: "classic-denim-jacket",
      base: "89.00",
    },
    {
      sellerIdx: 1,
      categoryId: catClothing.id,
      name: "Running Tee",
      slug: "running-tee",
      base: "34.00",
    },
    {
      sellerIdx: 2,
      categoryId: catHome.id,
      name: "Ceramic Vase Set",
      slug: "ceramic-vase-set",
      base: "45.00",
    },
    {
      sellerIdx: 2,
      categoryId: catHome.id,
      name: "Linen Throw",
      slug: "linen-throw",
      base: "58.00",
    },
    {
      sellerIdx: 2,
      categoryId: catSports.id,
      name: "Trail Running Shoes",
      slug: "trail-running-shoes",
      base: "120.00",
    },
    {
      sellerIdx: 0,
      categoryId: catSports.id,
      name: "Yoga Mat Pro",
      slug: "yoga-mat-pro",
      base: "42.00",
    },
  ];

  type VariantRow = {
    id: string;
    productId: string;
    name: string;
    value: string;
    price: Prisma.Decimal;
    productName: string;
    sellerId: string;
  };

  const variantRows: VariantRow[] = [];

  for (let i = 0; i < productDefs.length; i++) {
    const def = productDefs[i];
    const seller = sellers[def.sellerIdx];
    const p = await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: def.categoryId,
        name: def.name,
        slug: def.slug,
        description: `Quality ${def.name} with warranty.`,
        basePrice: d(def.base),
        status: ProductStatus.ACTIVE,
      },
    });

    const [u0, u1, u2] = getSeedProductTripleUrls(def.slug);
    await prisma.productImage.createMany({
      data: [
        {
          productId: p.id,
          url: u0,
          altText: `${def.name} main`,
          isMain: true,
          position: 0,
        },
        {
          productId: p.id,
          url: u1,
          altText: `${def.name} angle`,
          isMain: false,
          position: 1,
        },
        {
          productId: p.id,
          url: u2,
          altText: `${def.name} detail`,
          isMain: false,
          position: 2,
        },
      ],
    });

    await prisma.productAttribute.createMany({
      data: [
        {
          productId: p.id,
          name: "Brand",
          value: `Brand-${i + 1}`,
        },
        {
          productId: p.id,
          name: "Warranty",
          value: "1 year",
        },
        {
          productId: p.id,
          name: "SKU-Prefix",
          value: `VX-${1000 + i}`,
        },
      ],
    });

    const v1Price = d(Number(def.base) + 10);
    const v2Price = d(Number(def.base) - 5);
    const v1 = await prisma.productVariant.create({
      data: {
        productId: p.id,
        name: "Size",
        value: "Standard",
        price: v1Price,
        stock: 25 + i,
        sku: `SKU-${def.slug}-std`,
      },
    });
    const v2 = await prisma.productVariant.create({
      data: {
        productId: p.id,
        name: "Size",
        value: "Large",
        price: v2Price,
        stock: 12 + i,
        sku: `SKU-${def.slug}-lg`,
      },
    });

    for (const v of [v1, v2]) {
      variantRows.push({
        id: v.id,
        productId: p.id,
        name: v.name,
        value: v.value,
        price: v.price,
        productName: p.name,
        sellerId: seller.id,
      });
    }
  }

  for (const c of customers) {
    await prisma.cart.create({
      data: {
        userId: c.id,
        items: {
          create: [
            {
              productId: variantRows[0].productId,
              variantId: variantRows[0].id,
              quantity: 1,
            },
            {
              productId: variantRows[2].productId,
              variantId: variantRows[2].id,
              quantity: 2,
            },
          ],
        },
      },
    });
  }

  const addresses = await Promise.all(
    customers.map((c, idx) =>
      prisma.address.create({
        data: {
          userId: c.id,
          label: "Home",
          fullName: c.name,
          phone: `+100000000${idx}`,
          street: `${100 + idx} Market St`,
          city: "Metropolis",
          state: "CA",
          zip: `9000${idx}`,
          country: "US",
          isDefault: true,
        },
      })
    )
  );

  const allUsers = [admin, moderator, ...sellerUsers, ...customers];

  function pickVariant(idx: number) {
    return variantRows[idx % variantRows.length];
  }

  const createdOrderItems: { id: string; userId: string; productId: string }[] =
    [];

  for (let ci = 0; ci < customers.length; ci++) {
    const customer = customers[ci];
    const address = addresses[ci];

    for (let oi = 0; oi < 2; oi++) {
      const vA = pickVariant(ci * 4 + oi * 2);
      const vB = pickVariant(ci * 4 + oi * 2 + 1);
      const qtyA = 1;
      const qtyB = oi === 0 ? 1 : 2;
      const order = await createOrderWithSellerOrders({
        userId: customer.id,
        addressId: address.id,
        deliveryMethod: "standard",
        deliveryCost: d("9.99"),
        lines: [
          { variantId: vA.id, quantity: qtyA },
          { variantId: vB.id, quantity: qtyB },
        ],
        orderStatus: OrderStatus.DELIVERED,
        sellerOrderStatus: SellerOrderStatus.DELIVERED,
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          method: PaymentMethod.CARD,
          status: PaymentStatus.COMPLETED,
          transactionId: `txn_${order.id.slice(0, 8)}`,
          paidAt: new Date(),
        },
      });

      for (const item of order.items) {
        const vr = variantRows.find((x) => x.id === item.variantId);
        if (!vr) continue;
        createdOrderItems.push({
          id: item.id,
          userId: customer.id,
          productId: vr.productId,
        });
      }
    }
  }

  let reviewRating = 4;
  for (const row of createdOrderItems) {
    await prisma.review.create({
      data: {
        productId: row.productId,
        userId: row.userId,
        orderItemId: row.id,
        rating: reviewRating,
        title: "Great purchase",
        body: "Happy with this product.",
        isVerified: true,
      },
    });
    reviewRating = reviewRating === 5 ? 4 : reviewRating + 1;
  }

  for (const u of allUsers) {
    for (let n = 0; n < 5; n++) {
      const t = notificationTypes[n % notificationTypes.length];
      await prisma.notification.create({
        data: {
          userId: u.id,
          type: t,
          title: `Notice ${n + 1} for ${u.email}`,
          body: `This is notification ${n + 1} (${t}).`,
          isRead: n % 2 === 0,
        },
      });
    }
  }
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
