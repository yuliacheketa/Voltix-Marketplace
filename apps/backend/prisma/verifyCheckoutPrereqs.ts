import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = [
    "users",
    "seller_profiles",
    "categories",
    "products",
    "product_images",
    "product_attributes",
    "product_variants",
    "carts",
    "cart_items",
    "addresses",
    "orders",
    "order_items",
    "seller_orders",
    "payments",
    "reviews",
    "notifications",
  ];

  const allCols = await prisma.$queryRaw<
    {
      table_name: string;
      column_name: string;
      data_type: string;
      udt_name: string;
    }[]
  >`
    SELECT table_name, column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `;
  const wanted = new Set(tables);
  const cols = allCols.filter((c) => wanted.has(c.table_name));

  console.log("--- STEP 1: columns in public schema (subset) ---");
  let prev = "";
  for (const c of cols) {
    if (c.table_name !== prev) {
      console.log(`\n[${c.table_name}]`);
      prev = c.table_name;
    }
    console.log(`  ${c.column_name}: ${c.data_type} (${c.udt_name})`);
  }

  console.log("\n--- STEP 2: row counts ---");
  const counts = await prisma.$queryRaw<
    { name: string; c: bigint }[]
  >`SELECT 'users' AS name, COUNT(*)::bigint AS c FROM users
    UNION ALL SELECT 'categories', COUNT(*)::bigint FROM categories
    UNION ALL SELECT 'products', COUNT(*)::bigint FROM products
    UNION ALL SELECT 'product_variants', COUNT(*)::bigint FROM product_variants
    UNION ALL SELECT 'seller_profiles', COUNT(*)::bigint FROM seller_profiles
    UNION ALL SELECT 'carts', COUNT(*)::bigint FROM carts`;
  for (const row of counts) {
    console.log(`${row.name}: ${row.c}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
