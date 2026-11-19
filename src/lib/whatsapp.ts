import type { CartLine } from "@/components/shop/cart-context";
import {
  products as sampleProducts,
  formatPrice,
  type Product,
} from "@/lib/products";

export type PaymentPreference = "Mobile Money (MoMo)" | "Cash" | "Bank Transfer";

export type WhatsAppOrderDetails = {
  customerName: string;
  customerPhone: string;
  deliveryLocation: string;
  deliveryAddress: string;
  paymentPreference: PaymentPreference;
  orderNotes: string;
};

export function getWhatsAppConfiguration() {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ?? "";
  const number = rawNumber.replace(/\D/g, "");
  const configured = /^\d{8,15}$/.test(number);

  return {
    configured,
    number: configured ? number : null,
  };
}

export function createWhatsAppOrderLink(message: string) {
  const { number } = getWhatsAppConfiguration();
  const destination = number ? `https://wa.me/${number}` : "https://wa.me/";

  return `${destination}?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppOrderMessage(
  details: WhatsAppOrderDetails,
  cart: CartLine[],
  catalogue: Product[] = sampleProducts,
) {
  const cartLines = cart.flatMap((line) => {
    const product = catalogue.find((entry) => entry.id === line.productId);
    if (!product) {
      return [];
    }

    return [
      {
        product,
        quantity: line.quantity,
        colour: line.colour,
        size: line.size,
        lineTotal: product.price * line.quantity,
      },
    ];
  });
  const estimatedTotal = cartLines.reduce(
    (total, line) => total + line.lineTotal,
    0,
  );

  return [
    "Hello KAMEA, I would like to place an order.",
    "",
    "CUSTOMER DETAILS",
    `Name: ${details.customerName.trim()}`,
    `Phone: ${details.customerPhone.trim()}`,
    `Delivery location: ${details.deliveryLocation.trim()}`,
    `Delivery address / landmark: ${details.deliveryAddress.trim()}`,
    "",
    "ORDER",
    ...cartLines.map(
      (line, index) =>
        `${index + 1}. ${line.product.name}\n   Colour: ${line.colour}\n   Size: ${line.size}\n   Quantity: ${line.quantity}\n   Unit price: ${formatPrice(line.product.price)}\n   Line total: ${formatPrice(line.lineTotal)}`,
    ),
    "",
    `Estimated order total: ${formatPrice(estimatedTotal)}`,
    `Preferred payment arrangement: ${details.paymentPreference}`,
    "I understand that payment is arranged directly with KAMEA on WhatsApp; no payment has been made on the website.",
    "",
    `Order notes: ${details.orderNotes.trim() || "None"}`,
    "",
    "Please confirm availability, delivery charges, the final total, and payment instructions with me here.",
  ].join("\n");
}
