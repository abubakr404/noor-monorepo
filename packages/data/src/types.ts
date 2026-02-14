import type { ZikrCategory } from "@repo/types";

export interface SeedZikr {
  arabicText: string;
  arabicTextClean: string;
  translationEn: string;
  translationAr: string;
  transliteration: string;
  repeatCount: number;
  reference: string;
  virtueAr: string;
  virtueEn: string;
  category: ZikrCategory;
  orderIndex: number;
}

export interface SeedCounterPreset {
  labelAr: string;
  labelEn: string;
  targetCount: number;
  orderIndex: number;
}
