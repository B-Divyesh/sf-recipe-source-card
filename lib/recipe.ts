import type { PageScan, ParseResult, RecipeDraft } from './types';

type JsonObject = Record<string, unknown>;

const text = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ');
  if (value && typeof value === 'object' && 'name' in value) return text((value as JsonObject).name);
  return '';
};

const list = (value: unknown): string[] => {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.map(text).filter(Boolean);
};

function instructionList(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string') {
    return value
      .split(/\r?\n+/)
      .map((step) => step.replace(/^\s*\d+[.)]\s*/, '').trim())
      .filter(Boolean);
  }
  if (Array.isArray(value)) return value.flatMap(instructionList);
  if (typeof value === 'object') {
    const object = value as JsonObject;
    if (object.itemListElement) return instructionList(object.itemListElement);
    return instructionList(object.text ?? object.name);
  }
  return [];
}

function image(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return image(value[0]);
  if (value && typeof value === 'object') return text((value as JsonObject).url ?? (value as JsonObject).contentUrl);
  return '';
}

function hasRecipeType(object: JsonObject): boolean {
  const type = object['@type'];
  return (Array.isArray(type) ? type : [type]).some((item) => String(item).toLowerCase() === 'recipe');
}

function findRecipes(value: unknown): JsonObject[] {
  if (Array.isArray(value)) return value.flatMap(findRecipes);
  if (!value || typeof value !== 'object') return [];
  const object = value as JsonObject;
  const here = hasRecipeType(object) ? [object] : [];
  return [...here, ...findRecipes(object['@graph'])];
}

function idFor(sourceUrl: string, name: string): string {
  let hash = 2166136261;
  for (const char of `${sourceUrl}\0${name}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `recipe-${(hash >>> 0).toString(36)}`;
}

export function parsePageScan(scan: PageScan, now = new Date()): ParseResult {
  const objects: JsonObject[] = [];
  let invalidBlocks = 0;
  for (const block of scan.jsonLd) {
    try {
      objects.push(...findRecipes(JSON.parse(block)));
    } catch {
      invalidBlocks += 1;
    }
  }

  const sourceUrl = /^https?:\/\//.test(scan.canonicalUrl) ? scan.canonicalUrl : scan.url;
  const capturedAt = now.toISOString();
  const recipes = objects.map((object) => {
    const name = text(object.name) || 'Untitled recipe';
    return {
      id: idFor(sourceUrl, name),
      name,
      description: text(object.description),
      author: text(object.author),
      yield: text(object.recipeYield),
      prepTime: text(object.prepTime),
      cookTime: text(object.cookTime),
      totalTime: text(object.totalTime),
      ingredients: list(object.recipeIngredient ?? object.ingredients),
      instructions: instructionList(object.recipeInstructions),
      imageUrl: image(object.image),
      sourceUrl,
      sourceSite: scan.siteName,
      datePublished: text(object.datePublished),
      capturedAt,
    } satisfies RecipeDraft;
  });

  return { recipes, invalidBlocks };
}

export function recipeAsJson(recipe: RecipeDraft): string {
  return JSON.stringify({ schemaVersion: 1, ...recipe }, null, 2);
}

const safeLine = (value: string) => value.replace(/\s+/g, ' ').trim();

export function recipeAsMarkdown(recipe: RecipeDraft): string {
  const meta = [
    recipe.author && `Author: ${safeLine(recipe.author)}`,
    recipe.yield && `Yield: ${safeLine(recipe.yield)}`,
    recipe.totalTime && `Total time: ${safeLine(recipe.totalTime)}`,
  ].filter(Boolean);
  return [
    `# ${safeLine(recipe.name)}`,
    '',
    `Source: ${recipe.sourceUrl}`,
    recipe.sourceSite ? `Site: ${safeLine(recipe.sourceSite)}` : '',
    recipe.datePublished ? `Published: ${safeLine(recipe.datePublished)}` : '',
    ...meta,
    '',
    recipe.description ? `${recipe.description.trim()}\n` : '',
    '## Ingredients',
    '',
    ...(recipe.ingredients.length ? recipe.ingredients.map((item) => `- ${safeLine(item)}`) : ['_No ingredients were exposed by the source._']),
    '',
    '## Instructions',
    '',
    ...(recipe.instructions.length ? recipe.instructions.map((step, index) => `${index + 1}. ${safeLine(step)}`) : ['_No instructions were exposed by the source._']),
    '',
    `Captured with Recipe Source Card on ${recipe.capturedAt.slice(0, 10)}.`,
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n')
    .trim()
    .concat('\n');
}
