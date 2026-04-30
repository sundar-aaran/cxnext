import { describe, expect, it } from "vitest";
import type { DomainEvent } from "@cxnext/core";
import { CreateProductUseCase } from "../../../apps/server/src/modules/products/application/use-cases/create-product.use-case";
import { DeleteProductUseCase } from "../../../apps/server/src/modules/products/application/use-cases/delete-product.use-case";
import { UpdateProductUseCase } from "../../../apps/server/src/modules/products/application/use-cases/update-product.use-case";
import type { ProductDomainEventPublisher } from "../../../apps/server/src/modules/products/application/services/domain-event-publisher";
import type { ProductRepository } from "../../../apps/server/src/modules/products/application/services/product.repository";
import type { ProductRecord } from "../../../apps/server/src/modules/products/domain/product-record";

const productRecord: ProductRecord = {
  id: "1",
  uuid: "product-uuid",
  code: "PRD0001",
  name: "Aster Shirt",
  slug: "aster-shirt",
  description: null,
  shortDescription: null,
  brandId: null,
  brandName: null,
  categoryId: null,
  categoryName: null,
  productGroupId: null,
  productGroupName: null,
  productTypeId: null,
  productTypeName: null,
  unitId: null,
  hsnCodeId: null,
  styleId: null,
  sku: "ASTER-SHIRT-001",
  hasVariants: false,
  basePrice: 100,
  costPrice: 60,
  taxId: null,
  isFeatured: false,
  isActive: true,
  storefrontDepartment: null,
  homeSliderEnabled: false,
  promoSliderEnabled: false,
  featureSectionEnabled: false,
  discoveryBoardEnabled: false,
  discoveryBoardOrder: 0,
  visualStripEnabled: false,
  visualStripOrder: 0,
  isNewArrival: false,
  isBestSeller: false,
  isFeaturedLabel: false,
  primaryImageUrl: null,
  variantCount: 0,
  attributeCount: 0,
  totalStockQuantity: 0,
  tagCount: 0,
  tagNames: [],
  createdAt: new Date("2026-04-30T00:00:00.000Z"),
  updatedAt: new Date("2026-04-30T00:00:00.000Z"),
  deletedAt: null,
  images: [],
  variants: [],
  prices: [],
  discounts: [],
  offers: [],
  attributes: [],
  attributeValues: [],
  variantMap: [],
  stockItems: [],
  stockMovements: [],
  seo: null,
  storefront: null,
  tags: [],
  reviews: [],
};

function repository(overrides: Partial<ProductRepository> = {}): ProductRepository {
  return {
    list: async () => [],
    getById: async () => null,
    create: async () => productRecord,
    update: async () => productRecord,
    softDelete: async () => true,
    ...overrides,
  };
}

function publisher(events: DomainEvent[]): ProductDomainEventPublisher {
  return {
    publishAll: async (publishedEvents) => {
      events.push(...publishedEvents);
    },
  };
}

describe("product write use cases", () => {
  it("publishes product-created after create persistence succeeds", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new CreateProductUseCase(repository(), publisher(publishedEvents)).execute({
      name: "Aster Shirt",
      sku: "ASTER-SHIRT-001",
      isActive: true,
    });

    expect(publishedEvents[0]?.eventName).toBe("products.product-created");
    expect(publishedEvents[0]?.aggregateId).toBe("1");
  });

  it("publishes product-updated only when a record is updated", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new UpdateProductUseCase(
      repository({ list: async () => [productRecord] }),
      publisher(publishedEvents),
    ).execute("1", {
      name: "Aster Shirt",
      sku: "ASTER-SHIRT-001",
      isActive: true,
    });

    await new UpdateProductUseCase(repository(), publisher(publishedEvents)).execute("missing", {
      name: "Missing Product",
      sku: "MISSING-001",
      isActive: true,
    });

    expect(publishedEvents.map((event) => event.eventName)).toEqual(["products.product-updated"]);
  });

  it("publishes product-deleted only after a successful soft delete", async () => {
    const publishedEvents: DomainEvent[] = [];

    await new DeleteProductUseCase(repository(), publisher(publishedEvents)).execute("1");
    await new DeleteProductUseCase(
      repository({ softDelete: async () => false }),
      publisher(publishedEvents),
    ).execute("missing");

    expect(publishedEvents.map((event) => event.eventName)).toEqual(["products.product-deleted"]);
  });
});
