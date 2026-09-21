import { BUSINESS } from "@/lib/constants";
import { formatLKR } from "@/lib/format";

export function buildWhatsAppOrderLink(params: {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  notes?: string;
  items: { productName: string; variantLabel: string; quantity: number; lineTotal: number }[];
  totalAmount: number;
}) {
  const lines = [
    `Hi Elarenza! I just placed an order.`,
    ``,
    `*Order No:* ${params.orderNumber}`,
    ``,
    `*Order Details*`,
    ...params.items.map(
      (item) =>
        `- ${item.productName} (${item.variantLabel}) x${item.quantity} = ${formatLKR(item.lineTotal)}`
    ),
    `*Total:* ${formatLKR(params.totalAmount)}`,
    ``,
    `*Delivery Details*`,
    `Name: ${params.customerName}`,
    `Phone: ${params.phone}`,
    `Address: ${params.address}`,
    `City: ${params.city}`,
    `District: ${params.district}`,
    ...(params.notes ? [`Notes: ${params.notes}`] : []),
    ``,
    `Please confirm my order. Thank you!`,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${BUSINESS.phoneWhatsApp}?text=${text}`;
}
