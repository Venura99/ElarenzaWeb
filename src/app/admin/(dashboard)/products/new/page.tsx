import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";
import { createProductAction } from "../actions";

const emptyValues: ProductFormValues = {
  name: "",
  brand: "",
  description: "",
  gender: "UNISEX",
  concentration: "Eau de Parfum",
  topNotes: "",
  middleNotes: "",
  baseNotes: "",
  featured: false,
  isActive: true,
  images: [],
  variants: [],
};

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Add Product</h1>
      <div className="mt-6">
        <ProductForm
          initialValues={emptyValues}
          action={createProductAction}
          submitLabel="Create Product"
        />
      </div>
    </div>
  );
}
