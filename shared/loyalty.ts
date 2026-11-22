/** Loyalty thresholds shared by the API and the profile screen. */
export const TIERS = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 500 },
  { name: "Gold", min: 1600 },
  { name: "Platinum", min: 4000 },
] as const;

export function tierFor(points: number): string {
  let tier: string = TIERS[0].name;
  for (const entry of TIERS) if (points >= entry.min) tier = entry.name;
  return tier;
}

export function nextTier(points: number): { name: string; min: number } | null {
  return TIERS.find((entry) => points < entry.min) ?? null;
}

export const POINTS_PER_TAKA = 1;
