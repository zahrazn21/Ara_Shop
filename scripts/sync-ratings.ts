import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true } });

  for (const { id } of products) {
    const { _avg, _count } = await prisma.review.aggregate({
      where: { productId: id, status: "APPROVED" },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await prisma.product.update({
      where: { id },
      data: {
        rating: _avg.rating ? Math.round(_avg.rating * 10) / 10 : 0,
        reviewCount: _count._all,
      },
    });
  }
  console.log("تمام شد");
}

main().finally(() => prisma.$disconnect());