import { TRUSTED_SELLER } from '@/constants/config';

/** Trusted Seller rule from the proposal: 5+ completed sales, avg rating >= 4.5, no upheld reports. */
export function evaluateTrusted({ completedSales = 0, ratingAvg = 0, upheldReports = 0 }) {
  return (
    completedSales >= TRUSTED_SELLER.minCompletedSales &&
    ratingAvg >= TRUSTED_SELLER.minAverageRating &&
    upheldReports <= TRUSTED_SELLER.maxUpheldReports
  );
}
