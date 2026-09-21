"use client";

import { useFormStatus } from "react-dom";
import Spinner from "@/components/site/Spinner";

export default function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? <Spinner label={pendingLabel} /> : children}
    </button>
  );
}
