import { BUSINESS } from "@/lib/constants";

export function buildWhatsAppOrderLink(params: {
  orderNumber: string;
  customerName: string;
  items: { productName: string; variantLabel: string; quantity: number; lineTotal: number }[];
  totalAmount: number;
}) {
  const lines = [
    `Hi Elarenza! I just placed an order.`,
    ``,
    `Order No: ${params.orderNumber}`,
    `Name: ${params.customerName}`,
    ``,
    ...params.items.map(
      (item) =>
        `- ${item.productName} (${item.variantLabel}) x${item.quantity} = Rs. ${item.lineTotal.toLocaleString()}`
    ),
    ``,
    `Total: Rs. ${params.totalAmount.toLocaleString()}`,
    ``,
    `Please confirm my order. Thank you!`,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${BUSINESS.phoneWhatsApp}?text=${text}`;
}
