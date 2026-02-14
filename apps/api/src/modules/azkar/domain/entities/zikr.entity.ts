export interface ZikrEntity {
  id: number;
  arabicText: string;
  arabicTextClean: string | null;
  translationEn: string | null;
  translationAr: string | null;
  transliteration: string | null;
  repeatCount: number;
  reference: string | null;
  virtueAr: string | null;
  virtueEn: string | null;
  category: string;
  orderIndex: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
