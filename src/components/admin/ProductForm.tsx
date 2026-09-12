"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Variant = {
  id: string;
  type: "DECANT" | "FULL_BOTTLE";
  sizeMl: number;
  price: number;
  stock: number;
};

type ExistingImage = { id: string; url: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  brand: string;
  description: string;
  gender: "MALE" | "FEMALE" | "UNISEX";
  concentration: string;
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  featured: boolean;
  isActive: boolean;
  images: ExistingImage[];
  variants: Variant[];
};

let localId = 0;
function nextId() {
  localId += 1;
  return `local-${localId}`;
}

export default function ProductForm({
  initialValues,
  action,
  submitLabel,
}: {
  initialValues: ProductFormValues;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>(
    initialValues.variants.length > 0
      ? initialValues.variants
      : [{ id: nextId(), type: "DECANT", sizeMl: 5, price: 0, stock: 10 }]
  );
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initialValues.images);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { id: nextId(), type: "DECANT", sizeMl: 10, price: 0, stock: 10 },
    ]);
  }

  function removeVariant(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }

  function updateVariant(id: string, patch: Partial<Variant>) {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function removeExistingImage(id: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    if (variants.length === 0) {
      setError("Add at least one variant (decant or full bottle).");
      return;
    }
    formData.set(
      "variantsJson",
      JSON.stringify(
        variants.map((v) => ({
          type: v.type,
          sizeMl: v.sizeMl,
          price: v.price,
          stock: v.stock,
        }))
      )
    );
    formData.set("removedImageIds", removedImageIds.join(","));

    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className="rounded-2xl border border-gold-light/50 bg-white p-6">
        <h2 className="font-serif text-xl text-ink">Basic Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Product Name">
            <input
              name="name"
              defaultValue={initialValues.name}
              required
              className="input"
            />
          </Field>
          <Field label="Brand">
            <input
              name="brand"
              defaultValue={initialValues.brand}
              required
              className="input"
            />
          </Field>
          <Field label="Gender">
            <select name="gender" defaultValue={initialValues.gender} className="input">
              <option value="UNISEX">Unisex</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </Field>
          <Field label="Concentration">
            <input
              name="concentration"
              defaultValue={initialValues.concentration}
              placeholder="Eau de Parfum"
              className="input"
            />
          </Field>
        </div>
        <Field label="Description" className="mt-4">
          <textarea
            name="description"
            defaultValue={initialValues.description}
            required
            rows={4}
            className="input"
          />
        </Field>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Top Notes">
            <input name="topNotes" defaultValue={initialValues.topNotes} className="input" />
          </Field>
          <Field label="Middle Notes">
            <input name="middleNotes" defaultValue={initialValues.middleNotes} className="input" />
          </Field>
          <Field label="Base Notes">
            <input name="baseNotes" defaultValue={initialValues.baseNotes} className="input" />
          </Field>
        </div>

        <div className="mt-4 flex gap-6">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" name="featured" defaultChecked={initialValues.featured} />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" name="isActive" defaultChecked={initialValues.isActive} />
            Visible on shop
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gold-light/50 bg-white p-6">
        <h2 className="font-serif text-xl text-ink">Images</h2>
        {existingImages.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative">
                <Image
                  src={img.url}
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <input type="file" name="images" accept="image/*" multiple className="text-sm" />
          <p className="mt-1 text-xs text-ink-soft">You can select multiple images.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-gold-light/50 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Variants &amp; Pricing</h2>
          <button
            type="button"
            onClick={addVariant}
            className="rounded-full border border-gold px-3 py-1 text-sm text-gold-dark hover:bg-gold hover:text-white"
          >
            + Add Variant
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {variants.map((v) => (
            <div
              key={v.id}
              className="grid grid-cols-2 gap-3 rounded-xl border border-gold-light/40 p-3 sm:grid-cols-5 sm:items-end"
            >
              <Field label="Type">
                <select
                  value={v.type}
                  onChange={(e) =>
                    updateVariant(v.id, { type: e.target.value as Variant["type"] })
                  }
                  className="input"
                >
                  <option value="DECANT">Decant</option>
                  <option value="FULL_BOTTLE">Full Bottle</option>
                </select>
              </Field>
              <Field label="Size (ml)">
                <input
                  type="number"
                  min={1}
                  value={v.sizeMl}
                  onChange={(e) => updateVariant(v.id, { sizeMl: Number(e.target.value) })}
                  className="input"
                />
              </Field>
              <Field label="Price (LKR)">
                <input
                  type="number"
                  min={0}
                  value={v.price}
                  onChange={(e) => updateVariant(v.id, { price: Number(e.target.value) })}
                  className="input"
                />
              </Field>
              <Field label="Stock">
                <input
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => updateVariant(v.id, { stock: Number(e.target.value) })}
                  className="input"
                />
              </Field>
              <button
                type="button"
                onClick={() => removeVariant(v.id)}
                className="h-10 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-gold-dark disabled:opacity-60"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(198, 161, 91, 0.4);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: var(--color-gold);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className ?? ""}`}>
      <span className="mb-1 block font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
