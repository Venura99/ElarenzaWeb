import { and, desc, eq, gte, ne, sql } from "drizzle-orm";
import { db, schema } from "@/db";

/**
 * Sales figures for the admin dashboard.
 *
 * What counts is a judgement, so it is made once here rather than differently
 * on each page. An order counts towards revenue unless it was cancelled or
 * its card payment failed — a failed payment produced an order row but no
 * money, and counting those would overstate takings by exactly the amount
 * that never arrived.
 *
 * Cash on delivery is counted from the moment the order is placed. That is
 * optimistic, since a parcel can still be refused at the door, so the two are
 * reported separately as well.
 */

function countable() {
  return and(
    ne(schema.orders.status, "CANCELLED"),
    ne(schema.orders.paymentStatus, "FAILED")
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export type RevenueSummary = {
  today: number;
  todayOrders: number;
  month: number;
  monthOrders: number;
  allTime: number;
  allTimeOrders: number;
  averageOrder: number;
  /** Card payments already settled through Payzy. */
  paidOnline: number;
  /** Cash on delivery still to be collected. */
  awaitingCash: number;
};

export async function getRevenueSummary(): Promise<RevenueSummary> {
  const totals = sql<number>`coalesce(sum(${schema.orders.totalAmount}), 0)`;

  const [todayRows, monthRows, allRows, onlineRows, cashRows] = await Promise.all([
    db
      .select({ sum: totals, n: sql<number>`count(*)` })
      .from(schema.orders)
      .where(and(countable(), gte(schema.orders.createdAt, startOfToday()))),
    db
      .select({ sum: totals, n: sql<number>`count(*)` })
      .from(schema.orders)
      .where(and(countable(), gte(schema.orders.createdAt, startOfMonth()))),
    db.select({ sum: totals, n: sql<number>`count(*)` }).from(schema.orders).where(countable()),
    db
      .select({ sum: totals })
      .from(schema.orders)
      .where(and(countable(), eq(schema.orders.paymentStatus, "PAID"))),
    db
      .select({ sum: totals })
      .from(schema.orders)
      .where(
        and(
          countable(),
          eq(schema.orders.paymentMethod, "COD"),
          ne(schema.orders.status, "COMPLETED")
        )
      ),
  ]);

  const allTime = Number(allRows[0]?.sum ?? 0);
  const allTimeOrders = Number(allRows[0]?.n ?? 0);

  return {
    today: Number(todayRows[0]?.sum ?? 0),
    todayOrders: Number(todayRows[0]?.n ?? 0),
    month: Number(monthRows[0]?.sum ?? 0),
    monthOrders: Number(monthRows[0]?.n ?? 0),
    allTime,
    allTimeOrders,
    averageOrder: allTimeOrders > 0 ? allTime / allTimeOrders : 0,
    paidOnline: Number(onlineRows[0]?.sum ?? 0),
    awaitingCash: Number(cashRows[0]?.sum ?? 0),
  };
}

export type TopProduct = {
  productName: string;
  quantity: number;
  revenue: number;
};

/** Best sellers by units, across orders that count towards revenue. */
export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const rows = await db
    .select({
      productName: schema.orderItems.productName,
      quantity: sql<number>`sum(${schema.orderItems.quantity})`,
      revenue: sql<number>`sum(${schema.orderItems.lineTotal})`,
    })
    .from(schema.orderItems)
    .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
    .where(countable())
    .groupBy(schema.orderItems.productName)
    .orderBy(desc(sql`sum(${schema.orderItems.quantity})`))
    .limit(limit);

  return rows.map((row) => ({
    productName: row.productName,
    quantity: Number(row.quantity),
    revenue: Number(row.revenue),
  }));
}

/** Variants running low, so a sold-out decant is noticed before a customer finds it. */
export async function getLowStock(threshold = 3, limit = 6) {
  const rows = await db
    .select({
      productName: schema.products.name,
      slug: schema.products.slug,
      productId: schema.products.id,
      sizeMl: schema.productVariants.sizeMl,
      type: schema.productVariants.type,
      stock: schema.productVariants.stock,
    })
    .from(schema.productVariants)
    .innerJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
    .where(and(eq(schema.products.isActive, true), sql`${schema.productVariants.stock} <= ${threshold}`))
    .orderBy(schema.productVariants.stock)
    .limit(limit);

  return rows;
}
