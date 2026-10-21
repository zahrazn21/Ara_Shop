-- DropIndex
DROP INDEX "product_variants_productId_color_size_number_key";

-- DropIndex
DROP INDEX "products_slug_idx";

CREATE UNIQUE INDEX "product_variants_combo_key"
  ON "product_variants" ("productId", COALESCE("color", ''), COALESCE("size", ''), COALESCE("number", ''));

CREATE UNIQUE INDEX "reviews_one_active_per_user_product"
  ON "reviews" ("userId", "productId")
  WHERE "status" IN ('PENDING', 'APPROVED');