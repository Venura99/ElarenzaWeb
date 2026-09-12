export function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  if (digits.startsWith("94")) return digits;
  return `94${digits}`;
}
