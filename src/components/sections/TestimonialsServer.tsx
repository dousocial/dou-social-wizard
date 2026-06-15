import { fetchGoogleReviews } from "@/lib/googleReviews";
import { Testimonials } from "./Testimonials";

export async function TestimonialsServer() {
  const reviews = await fetchGoogleReviews();
  return <Testimonials reviews={reviews.length > 0 ? reviews : undefined} />;
}
