import { fetchGoogleReviews } from "@/lib/googleReviews";
import { Testimonials } from "./Testimonials";

export async function TestimonialsServer() {
  const reviews = await fetchGoogleReviews();
  return reviews.length > 0 ? <Testimonials reviews={reviews} /> : null;
}
