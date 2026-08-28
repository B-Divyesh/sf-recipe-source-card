import { describe, expect, it } from 'vitest';
import { parsePageScan, recipeAsJson, recipeAsMarkdown } from '../lib/recipe';
import type { PageScan } from '../lib/types';

const scan = (json: unknown): PageScan => ({ url: 'https://food.example/story?ref=home', canonicalUrl: 'https://food.example/recipes/soup', siteName: 'Example Kitchen', jsonLd: [JSON.stringify(json)] });

describe('Recipe JSON-LD parsing', () => {
  it('finds recipes in @graph and preserves the canonical source', () => {
    const result = parsePageScan(scan({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebPage', name: 'Soup story' },
      { '@type': ['Thing', 'Recipe'], name: 'Quiet soup', author: { '@type': 'Person', name: 'A. Cook' }, recipeYield: ['4 bowls'], prepTime: 'PT10M', recipeIngredient: ['2 onions', '1 litre stock'], recipeInstructions: [{ '@type': 'HowToSection', itemListElement: [{ '@type': 'HowToStep', text: 'Slice onions.' }] }, { '@type': 'HowToStep', text: 'Simmer gently.' }], image: [{ url: 'https://food.example/soup.webp' }] },
    ] }), new Date('2026-08-28T12:00:00Z'));
    expect(result.recipes).toHaveLength(1);
    expect(result.recipes[0]).toMatchObject({ name: 'Quiet soup', author: 'A. Cook', yield: '4 bowls', sourceUrl: 'https://food.example/recipes/soup', instructions: ['Slice onions.', 'Simmer gently.'] });
  });

  it('reports malformed blocks but still uses valid ones', () => {
    const page = scan({ '@type': 'Recipe', name: 'Toast', recipeInstructions: '1. Toast bread.\n2. Eat warm.' });
    page.jsonLd.unshift('{broken');
    const result = parsePageScan(page);
    expect(result.invalidBlocks).toBe(1);
    expect(result.recipes[0]?.instructions).toEqual(['Toast bread.', 'Eat warm.']);
  });

  it('does not invent a recipe from unrelated structured data', () => {
    expect(parsePageScan(scan({ '@type': 'Article', name: 'Ten dinners' })).recipes).toEqual([]);
  });
});

describe('source-preserving exports', () => {
  const recipe = parsePageScan(scan({ '@type': 'Recipe', name: 'Source stew', recipeIngredient: ['beans'], recipeInstructions: [{ text: 'Cook.' }] }), new Date('2026-08-28T12:00:00Z')).recipes[0]!;
  it('keeps source URL in JSON', () => expect(JSON.parse(recipeAsJson(recipe))).toMatchObject({ schemaVersion: 1, sourceUrl: 'https://food.example/recipes/soup' }));
  it('keeps source URL in Markdown', () => expect(recipeAsMarkdown(recipe)).toContain('Source: https://food.example/recipes/soup'));
});
