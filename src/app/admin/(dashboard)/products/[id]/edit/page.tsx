import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";
import { updateProductAction } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, variants: true },
  });

  if (!product) notFound();

  const initialValues: ProductFormValues = {
    id: product.id,
    name: product.name,
    brand: product.brand,
    description: product.description,
    gender: product.gender,
    concentration: product.concentration,
    topNotes: product.topNotes,
    middleNotes: product.middleNotes,
    baseNotes: product.baseNotes,
    featured: product.featured,
    isActive: product.isActive,
    images: product.images.map((img) => ({ id: img.id, url: img.url })),
    variants: product.variants.map((v) => ({
      id: v.id,
      type: v.type,
      sizeMl: v.sizeMl,
      price: v.price,
      stock: v.stock,
    })),
  };

  const boundAction = updateProductAction.bind(null, product.id);

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Edit Product</h1>
      <div className="mt-6">
        <ProductForm
          initialValues={initialValues}
          action={boundAction}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
