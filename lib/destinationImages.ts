// Curated, verified Unsplash photos (stable images.unsplash.com CDN URLs).
// Keyed by the exact destination names in CANDIDATE_DESTINATIONS (lib/destinations.ts).
export const DESTINATION_IMAGES: Record<string, string> = {
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
  Manali: "https://images.unsplash.com/photo-1626621331169-5f34be280ed9",
  Rishikesh: "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
  Coorg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
  Pondicherry: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  Jaipur: "https://images.unsplash.com/photo-1477587458883-47145ed94245",
  Udaipur: "https://images.unsplash.com/photo-1599661046289-e31897846e41",
  Alleppey: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828";

export function destinationImageUrl(name: string, opts?: { w?: number; q?: number }): string {
  const base = DESTINATION_IMAGES[name] ?? FALLBACK_IMAGE;
  const w = opts?.w ?? 800;
  const q = opts?.q ?? 75;
  return `${base}?w=${w}&q=${q}&auto=format&fit=crop`;
}

export const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=70&auto=format&fit=crop";

export const DESTINATION_TYPE_ICONS: Record<string, string> = {
  beach: "🏖️",
  mountain: "⛰️",
  heritage: "🏛️",
  nature: "🌿",
  city: "🏙️",
  wellness: "🧘",
  nightlife: "🌃",
  adventure: "🧗",
};
