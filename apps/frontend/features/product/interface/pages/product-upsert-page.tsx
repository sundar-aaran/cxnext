"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import {
  AnimatedTabs,
  Button,
  Input,
  MasterListPageFrame,
  MasterListUpsertCard,
  MasterListUpsertLayout,
  Separator,
  useGlobalLoader,
} from "@cxnext/ui";
import {
  getProduct,
  prepareProductForSave,
  upsertProduct,
} from "../../application/product-upsert.service";
import type { ProductNestedRecord, ProductUpsertInput } from "../../domain/product";
import { createDefaultProductFormValues, toProductFormValues } from "../../domain/product-form";
import {
  AddRowButton,
  ProductField,
  ProductSection,
  ProductStatusSwitch,
  ProductTextInput,
  RemoveRowButton,
} from "../components/product-form-sections";

type ProductEditReturnTo = "list" | "show";

export function ProductUpsertPage({
  productId,
  returnTo = "show",
}: {
  readonly productId?: number;
  readonly returnTo?: ProductEditReturnTo;
}) {
  const router = useRouter();
  const { show: showGlobalLoader } = useGlobalLoader();
  const isEdit = Boolean(productId);
  const [form, setForm] = useState<ProductUpsertInput>(createDefaultProductFormValues());
  const [isLoaded, setIsLoaded] = useState(!isEdit);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setForm(createDefaultProductFormValues());
      setIsLoaded(true);
      return;
    }

    const controller = new AbortController();
    const hideGlobalLoader = showGlobalLoader();

    setIsLoaded(false);
    getProduct(productId, { signal: controller.signal })
      .then((record) => {
        if (record) {
          setForm(toProductFormValues(record));
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error(error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoaded(true);
          hideGlobalLoader();
        }
      });

    return () => {
      controller.abort();
      hideGlobalLoader();
    };
  }, [productId, showGlobalLoader]);

  async function saveProduct() {
    if (form.name.trim().length < 2) {
      setMessage("Enter product name.");
      return;
    }

    const hideGlobalLoader = showGlobalLoader();

    try {
      const product = await upsertProduct(prepareProductForSave(form), productId);
      toast.success(isEdit ? "Product updated" : "Product created", {
        description: `${product.name} was saved.`,
      });
      router.push(isEdit && returnTo === "list" ? "/desk/product" : `/desk/product/${product.id}`);
    } catch (error) {
      hideGlobalLoader();
      const errorMessage = getErrorMessage(error);
      setMessage(errorMessage);
      toast.error("Could not save product", { description: errorMessage });
    }
  }

  if (isEdit && !isLoaded) {
    return (
      <MasterListPageFrame
        description="Loading product record."
        technicalName="page.product.upsert.loading"
        title="Product"
      >
        <ProductSection title="Product setup">
          <p className="text-sm text-muted-foreground">Loading product.</p>
        </ProductSection>
      </MasterListPageFrame>
    );
  }

  return (
    <MasterListPageFrame
      action={
        <Button asChild variant="outline" className="rounded-xl">
          <Link
            href={productId && returnTo === "show" ? `/desk/product/${productId}` : "/desk/product"}
          >
            <X className="size-4" />
            Cancel
          </Link>
        </Button>
      }
      description={
        isEdit
          ? "Update catalogue identity, price, stock, SEO, and storefront settings."
          : "Create a structured product master record."
      }
      technicalName="page.product.upsert"
      title={isEdit ? "Edit product" : "New product"}
    >
      <MasterListUpsertLayout>
        <MasterListUpsertCard>
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              void saveProduct();
            }}
          >
            <AnimatedTabs
              tabs={[
                {
                  value: "details",
                  label: "Details",
                  content: <ProductDetailsTab form={form} setForm={setForm} />,
                },
                {
                  value: "catalogue",
                  label: "Catalogue",
                  content: <ProductCatalogueTab form={form} setForm={setForm} />,
                },
                {
                  value: "media",
                  label: "Media",
                  content: <ProductMediaTab form={form} setForm={setForm} />,
                },
                {
                  value: "tags",
                  label: "Tags",
                  content: <ProductTagsTab form={form} setForm={setForm} />,
                },
              ]}
            />
            {message ? (
              <p className="text-sm font-medium text-muted-foreground">{message}</p>
            ) : null}
            <Separator />
            <Button type="submit" className="rounded-xl">
              <Save className="size-4" />
              {isEdit ? "Update product" : "Create product"}
            </Button>
          </form>
        </MasterListUpsertCard>
      </MasterListUpsertLayout>
    </MasterListPageFrame>
  );
}

type ProductFormStateProps = {
  readonly form: ProductUpsertInput;
  readonly setForm: Dispatch<SetStateAction<ProductUpsertInput>>;
};

function ProductTabPanel({ children }: { readonly children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-5">
      {children}
    </div>
  );
}

function ProductDetailsTab({ form, setForm }: ProductFormStateProps) {
  return (
    <ProductTabPanel>
      <div className="grid gap-4 md:grid-cols-2">
        <ProductField label="Name">
          <ProductTextInput
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target.value,
                slug: form.slug || slugify(event.target.value),
                sku: form.sku || slugify(event.target.value).replace(/-/g, "_").toUpperCase(),
              })
            }
          />
        </ProductField>
        <ProductField label="Code">
          <ProductTextInput
            value={form.code}
            placeholder="Auto generated"
            onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
          />
        </ProductField>
        <ProductField label="Slug">
          <ProductTextInput
            value={form.slug}
            onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })}
          />
        </ProductField>
        <ProductField label="SKU">
          <ProductTextInput
            value={form.sku}
            onChange={(event) => setForm({ ...form, sku: event.target.value.toUpperCase() })}
          />
        </ProductField>
        <ProductField label="Short description">
          <textarea
            value={form.shortDescription ?? ""}
            className="min-h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm"
            onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
          />
        </ProductField>
        <ProductField label="Description">
          <textarea
            value={form.description ?? ""}
            className="min-h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm"
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </ProductField>
      </div>
    </ProductTabPanel>
  );
}

function ProductCatalogueTab({ form, setForm }: ProductFormStateProps) {
  return (
    <ProductTabPanel>
      <div className="grid gap-4 md:grid-cols-2">
        <ProductField label="Brand">
          <ProductTextInput
            value={form.brandName ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                brandName: event.target.value,
                brandId: event.target.value ? `brand:${slugify(event.target.value)}` : null,
              })
            }
          />
        </ProductField>
        <ProductField label="Category">
          <ProductTextInput
            value={form.categoryName ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                categoryName: event.target.value,
                categoryId: event.target.value
                  ? `product-category:${slugify(event.target.value)}`
                  : null,
              })
            }
          />
        </ProductField>
        <ProductField label="Group">
          <ProductTextInput
            value={form.productGroupName ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                productGroupName: event.target.value,
                productGroupId: event.target.value
                  ? `product-group:${slugify(event.target.value)}`
                  : null,
              })
            }
          />
        </ProductField>
        <ProductField label="Type">
          <ProductTextInput
            value={form.productTypeName ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                productTypeName: event.target.value,
                productTypeId: event.target.value
                  ? `product-type:${slugify(event.target.value)}`
                  : null,
              })
            }
          />
        </ProductField>
        <ProductField label="Base price">
          <Input
            type="number"
            className="h-11 rounded-xl"
            value={form.basePrice}
            onChange={(event) => setForm({ ...form, basePrice: Number(event.target.value || 0) })}
          />
        </ProductField>
        <ProductField label="Cost price">
          <Input
            type="number"
            className="h-11 rounded-xl"
            value={form.costPrice}
            onChange={(event) => setForm({ ...form, costPrice: Number(event.target.value || 0) })}
          />
        </ProductField>
        <ProductField label="Storefront department">
          <ProductTextInput
            value={form.storefrontDepartment ?? ""}
            onChange={(event) =>
              setForm({ ...form, storefrontDepartment: event.target.value || null })
            }
          />
        </ProductField>
        <div className="md:col-span-2">
          <ProductStatusSwitch
            checked={form.isActive}
            onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
          />
        </div>
      </div>
    </ProductTabPanel>
  );
}

function ProductMediaTab({ form, setForm }: ProductFormStateProps) {
  return (
    <ProductTabPanel>
      <div className="mb-4 flex justify-end">
        <AddRowButton
          onClick={() =>
            setForm({
              ...form,
              images: [...form.images, { imageUrl: "", isPrimary: form.images.length === 0 }],
            })
          }
        />
      </div>
      <div className="space-y-4">
        {form.images.map((image, index) => (
          <div key={index} className="rounded-md border border-border/70 p-4">
            <div className="mb-3 flex justify-end">
              <RemoveRowButton
                onClick={() =>
                  setForm({
                    ...form,
                    images: form.images.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              />
            </div>
            <ProductField label="Image URL">
              <ProductTextInput
                value={String(image.imageUrl ?? "")}
                onChange={(event) =>
                  setForm({
                    ...form,
                    images: updateNested(form.images, index, {
                      imageUrl: event.target.value,
                    }),
                  })
                }
              />
            </ProductField>
          </div>
        ))}
      </div>
    </ProductTabPanel>
  );
}

function ProductTagsTab({ form, setForm }: ProductFormStateProps) {
  return (
    <ProductTabPanel>
      <div className="mb-4 flex justify-end">
        <AddRowButton onClick={() => setForm({ ...form, tags: [...form.tags, { name: "" }] })} />
      </div>
      <div className="space-y-4">
        {form.tags.map((tag, index) => (
          <div key={index} className="flex gap-2">
            <ProductTextInput
              value={String(tag.name ?? "")}
              onChange={(event) =>
                setForm({
                  ...form,
                  tags: updateNested(form.tags, index, { name: event.target.value }),
                })
              }
            />
            <RemoveRowButton
              onClick={() =>
                setForm({
                  ...form,
                  tags: form.tags.filter((_, itemIndex) => itemIndex !== index),
                })
              }
            />
          </div>
        ))}
      </div>
    </ProductTabPanel>
  );
}

function updateNested(
  items: readonly ProductNestedRecord[],
  index: number,
  patch: ProductNestedRecord,
) {
  return items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}
