export interface CandidateDestination {
  name: string;
  types: string[]; // e.g. ["beach", "nightlife"]
  costPerDay: number; // rough estimate per person, in INR
  tags: string[]; // matched against dealbreaker text
}

export const CANDIDATE_DESTINATIONS: CandidateDestination[] = [
  { name: "Goa", types: ["beach", "nightlife"], costPerDay: 3000, tags: ["flight", "beach", "nightlife"] },
  { name: "Manali", types: ["mountain", "adventure"], costPerDay: 2500, tags: ["mountain", "trekking", "cold"] },
  { name: "Rishikesh", types: ["mountain", "adventure", "wellness"], costPerDay: 2000, tags: ["camping", "rafting", "mountain"] },
  { name: "Coorg", types: ["mountain", "nature"], costPerDay: 2800, tags: ["nature", "homestay", "mountain"] },
  { name: "Pondicherry", types: ["beach", "heritage"], costPerDay: 2600, tags: ["beach", "heritage", "quiet"] },
  { name: "Jaipur", types: ["heritage", "city"], costPerDay: 2400, tags: ["heritage", "city", "shopping"] },
  { name: "Udaipur", types: ["heritage", "romantic"], costPerDay: 3200, tags: ["heritage", "lake", "luxury"] },
  { name: "Alleppey", types: ["beach", "nature", "wellness"], costPerDay: 3500, tags: ["backwaters", "houseboat", "nature"] },
];
