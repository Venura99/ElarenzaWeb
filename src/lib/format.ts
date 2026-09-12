export function formatLKR(amount: number) {
  return `Rs. ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function variantLabel(type: "DECANT" | "FULL_BOTTLE", sizeMl: number) {
  return type === "DECANT" ? `${sizeMl}ml Decant` : `${sizeMl}ml Full Bottle`;
}
