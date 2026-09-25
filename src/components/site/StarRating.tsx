export default function StarRating({ value }: { value: number }) {
  return (
    <span
      className="inline-flex text-base leading-none"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          aria-hidden="true"
          className={star <= value ? "text-gold" : "text-gold-light/40"}
        >
          ★
        </span>
      ))}
    </span>
  );
}
