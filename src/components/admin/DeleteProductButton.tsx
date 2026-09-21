"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/app/admin/(dashboard)/products/actions";
import Spinner from "@/components/site/Spinner";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProductAction(productId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? <Spinner className="h-3.5 w-3.5" label="Deleting..." /> : "Delete"}
    </button>
  );
}
