export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url?: string;
}

export async function fetchGoogleReviews(businessName = "Dou Social Denizli Reklam Ajansı"): Promise<GoogleReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  try {
    // 1) İşletmeyi isimle bul
    const searchRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({ textQuery: businessName }),
      next: { revalidate: 604800 }, // 7 günde bir yenile
    });

    const searchData = await searchRes.json();
    const placeId = searchData.places?.[0]?.id;
    if (!placeId) return [];

    // 2) Yorumları çek
    const detailRes = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "reviews",
        },
        next: { revalidate: 604800 },
      }
    );

    const detailData = await detailRes.json();
    const raw = detailData.reviews ?? [];

    return raw.map((r: Record<string, unknown>) => {
      const author = r.authorAttribution as Record<string, string> | undefined;
      const textObj = r.text as Record<string, string> | undefined;
      return {
        author_name:               author?.displayName ?? "Anonim",
        rating:                    Number(r.rating) || 5,
        text:                      textObj?.text ?? "",
        relative_time_description: String(r.relativePublishTimeDescription ?? ""),
        profile_photo_url:         author?.photoUri,
      };
    }).filter((r: GoogleReview) => r.text.length > 0 && r.rating === 5);
  } catch (err) {
    console.error("Google Reviews fetch error:", err);
    return [];
  }
}
