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

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-sky-100 text-sky-800",
  PROCESSING: "bg-violet-100 text-violet-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};