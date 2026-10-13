import type { Gender, OrderStatus, ProductStatus, ReviewStatus, SkinType, VolumeUnit } from "@prisma/client";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل داده‌شده",
  CANCELLED: "لغوشده",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  ACTIVE: "فعال",
  DRAFT: "پیش‌نویس",
  OUT_OF_STOCK: "ناموجود",
  ARCHIVED: "بایگانی",
};

export const VOLUME_UNIT_LABEL: Record<VolumeUnit, string> = {
  ML: "میلی‌لیتر",
  G: "گرم",
  OZ: "اونس",
  PCS: "عدد",
};

export const SKIN_TYPE_LABEL: Record<SkinType, string> = {
  NORMAL: "معمولی",
  DRY: "خشک",
  OILY: "چرب",
  COMBINATION: "مختلط",
  SENSITIVE: "حساس",
  ALL: "همه‌ی انواع پوست",
};

export const GENDER_LABEL: Record<Gender, string> = {
  WOMEN: "بانوان",
  MEN: "آقایان",
  UNISEX: "یونیسکس",
};

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  PENDING: "در انتظار تأیید",
  APPROVED: "تأییدشده",
  REJECTED: "ردشده",
};
