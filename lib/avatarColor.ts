// Deterministic, colorful avatar background for a name — same name always
// gets the same color, spread across a warm/travel-friendly palette.
const PALETTE = [
  "#FF5A5F", "#00A699", "#FC642D", "#7B61FF", "#00B2A9",
  "#FFB400", "#E31C5F", "#3D9970", "#0074D9", "#FF6F91",
];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}
