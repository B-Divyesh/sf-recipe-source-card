export interface PageScan {
  url: string;
  canonicalUrl: string;
  siteName: string;
  jsonLd: string[];
}

export interface RecipeDraft {
  id: string;
  name: string;
  description: string;
  author: string;
  yield: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  sourceUrl: string;
  sourceSite: string;
  datePublished: string;
  capturedAt: string;
}

export interface ParseResult {
  recipes: RecipeDraft[];
  invalidBlocks: number;
}

export interface StoredLicense {
  token: string;
  valid: boolean;
  checkedAt: number;
}

export interface SavedLibrary {
  recipes: RecipeDraft[];
}
