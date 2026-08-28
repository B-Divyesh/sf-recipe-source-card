import { parsePageScan, recipeAsJson, recipeAsMarkdown } from '../lib/recipe';
import type { RecipeDraft } from '../lib/types';

const DEMO_KEY = 'demo:recipe-source-card:draft';
const SAMPLE_SCAN = {
  url: 'https://recipes.example/lemon-sage-potatoes?ref=weekly', canonicalUrl: 'https://recipes.example/lemon-sage-potatoes', siteName: 'recipes.example',
  jsonLd: [JSON.stringify({ '@context': 'https://schema.org', '@type': 'Recipe', name: 'Lemon and sage roast potatoes', description: 'Crisp roast potatoes with lemon zest and fresh sage.', author: { '@type': 'Person', name: 'Mara Bell' }, recipeYield: '4 servings', totalTime: 'PT55M', datePublished: '2026-07-12', recipeIngredient: ['700 g small potatoes', '2 tbsp olive oil', '1 lemon, zested', '8 fresh sage leaves', '1 tsp sea salt'], recipeInstructions: [{ '@type': 'HowToStep', text: 'Heat the oven to 220°C.' }, { '@type': 'HowToStep', text: 'Toss the potatoes with oil, lemon zest, sage, and salt.' }, { '@type': 'HowToStep', text: 'Roast for 40 minutes, turning once.' }] })],
};
const form = document.querySelector<HTMLFormElement>('#demo-form')!;
const status = document.querySelector<HTMLElement>('#demo-status')!;
let draft = loadDraft();

function freshDraft(): RecipeDraft { return parsePageScan(SAMPLE_SCAN, new Date('2026-08-28T09:00:00.000Z')).recipes[0]!; }
function loadDraft(): RecipeDraft {
  const stored = localStorage.getItem(DEMO_KEY); if (!stored) return freshDraft();
  try { return JSON.parse(stored) as RecipeDraft; } catch { localStorage.removeItem(DEMO_KEY); return freshDraft(); }
}
function render(): void {
  const values: Record<string, string> = { name: draft.name, description: draft.description, author: draft.author, yield: draft.yield, totalTime: draft.totalTime, ingredients: draft.ingredients.join('\n'), instructions: draft.instructions.join('\n') };
  for (const [name, value] of Object.entries(values)) (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement).value = value;
}
function readForm(): RecipeDraft {
  const data = new FormData(form);
  draft = { ...draft, name: String(data.get('name') ?? '').trim() || 'Untitled recipe', description: String(data.get('description') ?? '').trim(), author: String(data.get('author') ?? '').trim(), yield: String(data.get('yield') ?? '').trim(), totalTime: String(data.get('totalTime') ?? '').trim(), ingredients: String(data.get('ingredients') ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean), instructions: String(data.get('instructions') ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean) };
  return draft;
}
function save(): void { localStorage.setItem(DEMO_KEY, JSON.stringify(readForm())); status.textContent = 'Demo change saved in isolated sample storage.'; }
function download(contents: string, extension: 'md' | 'json', mime: string): void {
  const recipe = readForm(); const filename = recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'recipe';
  const url = URL.createObjectURL(new Blob([contents], { type: `${mime};charset=utf-8` })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${filename}.${extension}`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = `${extension === 'md' ? 'Markdown' : 'JSON'} exported with the source URL.`;
}
form.addEventListener('input', save);
document.querySelector('#export-md')!.addEventListener('click', () => download(recipeAsMarkdown(readForm()), 'md', 'text/markdown'));
document.querySelector('#export-json')!.addEventListener('click', () => download(recipeAsJson(readForm()), 'json', 'application/json'));
document.querySelector('#reset-demo')!.addEventListener('click', () => { localStorage.removeItem(DEMO_KEY); draft = freshDraft(); render(); status.textContent = 'Demo reset to the original sample.'; (form.elements.namedItem('name') as HTMLInputElement).focus(); });
document.querySelector('#leave-demo')!.addEventListener('click', () => localStorage.removeItem(DEMO_KEY));
render();
localStorage.setItem(DEMO_KEY, JSON.stringify(draft));
if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
