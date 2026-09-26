import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, real, customType } from "drizzle-orm/sqlite-core";

// Mirrors the tables Prisma already created in Turso, so no data migration is
// needed. Column names must match the existing schema exactly.

// Prisma writes SQLite DateTime values as ISO-8601 *text*, not epoch integers,
// so the existing rows must be read and written in that same shape.
const isoTimestamp = customType<{ data: Date; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value) {
    return value.toISOString();
  },
  fromDriver(value) {
    return new Date(value);
  },
});

export const products = sqliteTable("Product", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  gender: text("gender").notNull().default("UNISEX"),
  concentration: text("concentration").notNull().default("Eau de Parfum"),
  topNotes: text("topNotes").notNull().default(""),
  middleNotes: text("middleNotes").notNull().default(""),
  baseNotes: text("baseNotes").notNull().default(""),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: isoTimestamp("createdAt").notNull(),
  updatedAt: isoTimestamp("updatedAt").notNull(),
});

export const productImages = sqliteTable("ProductImage", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  publicId: text("publicId"),
  position: integer("position").notNull().default(0),
  productId: text("productId").notNull(),
});

export const productVariants = sqliteTable("ProductVariant", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  sizeMl: integer("sizeMl").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  productId: text("productId").notNull(),
});

export const orders = sqliteTable("Order", {
  id: text("id").primaryKey(),
  orderNumber: text("orderNumber").notNull().unique(),
  customerName: text("customerName").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  district: text("district").notNull(),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("PENDING"),
  totalAmount: real("totalAmount").notNull(),
  createdAt: isoTimestamp("createdAt").notNull(),
  updatedAt: isoTimestamp("updatedAt").notNull(),
});

export const orderItems = sqliteTable("OrderItem", {
  id: text("id").primaryKey(),
  orderId: text("orderId").notNull(),
  productName: text("productName").notNull(),
  variantLabel: text("variantLabel").notNull(),
  unitPrice: real("unitPrice").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: real("lineTotal").notNull(),
});

export const feedback = sqliteTable("Feedback", {
  id: text("id").primaryKey(),
  customerName: text("customerName").notNull(),
  rating: integer("rating").notNull(),
  message: text("message").notNull(),
  isApproved: integer("isApproved", { mode: "boolean" }).notNull().default(false),
  createdAt: isoTimestamp("createdAt").notNull(),
});

export const feedbackImages = sqliteTable("FeedbackImage", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  publicId: text("publicId"),
  feedbackId: text("feedbackId").notNull(),
});

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  variants: many(productVariants),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const feedbackRelations = relations(feedback, ({ many }) => ({
  images: many(feedbackImages),
}));

export const feedbackImagesRelations = relations(feedbackImages, ({ one }) => ({
  feedback: one(feedback, {
    fields: [feedbackImages.feedbackId],
    references: [feedback.id],
  }),
}));
