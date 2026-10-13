import Stars from "./Stars";
import ReviewImages from "./ReviewImages";
import { faDate, toman } from "@/lib/format";

type Review = {
  id: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdAt: Date;
  user: { username: string };
};

export default function ProductReviews({
  reviews,
  rating,
  count,
}: {
  reviews: Review[];
  rating: number;
  count: number;
}) {
  if (reviews.length === 0) {
    return <p className="py-8 text-center text-sm text-plum-600">هنوز نظری برای این محصول ثبت نشده است.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-xl border border-blush-200 bg-white px-5 py-4">
        <p className="text-3xl font-bold text-plum-900">{toman(Number(rating.toFixed(1)))}</p>
        <div className="space-y-1">
          <Stars value={rating} size={18} />
          <p className="text-xs text-plum-600">از مجموع {toman(count)} نظر</p>
        </div>
      </div>

      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-xl border border-blush-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Stars value={r.rating} />
                <span className="text-xs font-bold text-plum-900">{r.user.username}</span>
              </div>
              <time dateTime={r.createdAt.toISOString()} className="text-xs text-plum-600">
                {faDate(r.createdAt)}
              </time>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-7">{r.comment}</p>
            {r.imageUrls.length > 0 && <ReviewImages images={r.imageUrls} />}
          </li>
        ))}
      </ul>
    </div>
  );
}