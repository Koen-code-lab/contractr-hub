// Canonical list of Belgian regions (provinces + Brussels Capital Region)
// used throughout the app for filters and forms.
export const BELGIAN_REGIONS = [
  "Antwerpen",
  "Limburg",
  "Oost-Vlaanderen",
  "Vlaams-Brabant",
  "West-Vlaanderen",
  "Brussel",
  "Waals-Brabant",
  "Henegouwen",
  "Luik",
  "Luxemburg",
  "Namen",
] as const;

export type BelgianRegion = (typeof BELGIAN_REGIONS)[number];
