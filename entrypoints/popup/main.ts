import { browser } from 'wxt/browser';
import { BILLING_BASE, CHECKOUT_URL, LICENSE_CACHE_KEY, LICENSE_KEY, shouldVerify, verifyLicense } from '../../lib/license';
import { scanVisibleRecipeMetadata } from '../../lib/page-scan';
import { parsePageScan, recipeAsJson, recipeAsMarkdown } from '../../lib/recipe';
import type { PageScan, RecipeDraft, SavedLibrary, StoredLicense } from '../../lib/types';

const DRAFT_KEY = 'recipe-source-card:draft';
const LIBRARY_KEY = 'recipe-source-card:library';
const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const notice = $('#notice');
const editor = $('#editor');
const empty = $('#empty');
const pageState = $('#page-state');
const captureButton = $<HTMLButtonElement>('#capture');
const sourceLink = $<HTMLAnchorElement>('#source-link');
const choiceWrap = $('#recipe-choice-wrap');
const choice = $<HTMLSelectElement>('#recipe-choice');
const recipeForm = $<HTMLFormElement>('#recipe-form');
const librarySection = $('#library');
const libraryList = $<HTMLUListElement>('#library-list');

let candidates: RecipeDraft[] = [];
let current: RecipeDraft | undefined;
let licensed = false;

function announce(message: string, tone: 'neutral' | 'error' | 'success' = 'neutral'): void {
  notice.textContent = message;
  notice.dataset.tone = tone;
}

function setBusy(busy: boolean): void {
  captureButton.disabled = busy;
  captureButton.textContent = busy ? 'Reading structured data…' : 'Capture recipe';
  captureButton.setAttribute('aria-busy', String(busy));
}

function assignForm(recipe: RecipeDraft): void {
  current = recipe;
  const values: Record<string, string> = {
    name: recipe.name,
    description: recipe.description,
    author: recipe.author,
    yield: recipe.yield,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    ingredients: recipe.ingredients.join('\n'),
    instructions: recipe.instructions.join('\n'),
  };
  for (const [name, value] of Object.entries(values)) {
    const control = recipeForm.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
    control.value = value;
  }
  sourceLink.href = recipe.sourceUrl;
  sourceLink.textContent = recipe.sourceSite || new URL(recipe.sourceUrl).hostname;
  sourceLink.title = recipe.sourceUrl;
  empty.hidden = true;
  editor.hidden = false;
  void browser.storage.local.set({ [DRAFT_KEY]: recipe });
}

function readForm(): RecipeDraft | undefined {
  if (!current) return undefined;
  const data = new FormData(recipeForm);
  current = {
    ...current,
    name: String(data.get('name') ?? '').trim() || 'Untitled recipe',
    description: String(data.get('description') ?? '').trim(),
    author: String(data.get('author') ?? '').trim(),
    yield: String(data.get('yield') ?? '').trim(),
    prepTime: String(data.get('prepTime') ?? '').trim(),
    cookTime: String(data.get('cookTime') ?? '').trim(),
    totalTime: String(data.get('totalTime') ?? '').trim(),
    ingredients: String(data.get('ingredients') ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    instructions: String(data.get('instructions') ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
  };
  return current;
}

async function capture(): Promise<void> {
  setBusy(true);
  announce('');
  pageState.textContent = 'Reading Recipe JSON-LD from the active tab…';
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || !/^https?:/.test(tab.url)) {
      throw new Error('Open a regular web recipe page, then try again. Browser settings pages cannot be read.');
    }
    const results = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: scanVisibleRecipeMetadata,
    });
    const scan = results[0]?.result as PageScan | undefined;
    if (!scan) throw new Error('The page did not return structured metadata. Reload it and try once more.');
    const result = parsePageScan(scan);
    candidates = result.recipes;
    if (!candidates.length) {
      pageState.textContent = 'No Recipe JSON-LD found.';
      throw new Error(
        result.invalidBlocks
          ? 'This page exposes structured data, but its recipe block is invalid. Try the publisher’s print view or export manually.'
          : 'This page does not expose a Recipe JSON-LD block. Recipe Source Card will not guess from page text.',
      );
    }
    choice.replaceChildren(...candidates.map((recipe, index) => new Option(recipe.name, String(index))));
    choiceWrap.hidden = candidates.length < 2;
    assignForm(candidates[0]!);
    pageState.textContent = `Found ${candidates.length === 1 ? 'one recipe' : `${candidates.length} recipes`} on ${candidates[0]!.sourceSite}.`;
    announce('Capture complete. Review every field before export.', 'success');
    $('#editor-heading').focus({ preventScroll: false });
  } catch (error) {
    announce(error instanceof Error ? error.message : 'Capture failed. Reload the recipe page and try again.', 'error');
  } finally {
    setBusy(false);
  }
}

function download(contents: string, extension: 'md' | 'json', mime: string): void {
  const recipe = readForm();
  if (!recipe) return;
  const name = recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'recipe';
  const url = URL.createObjectURL(new Blob([contents], { type: `${mime};charset=utf-8` }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${name}.${extension}`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce(`${extension === 'md' ? 'Markdown' : 'JSON'} exported with the source URL.`, 'success');
}

async function getLibrary(): Promise<SavedLibrary> {
  const stored = await browser.storage.local.get(LIBRARY_KEY);
  return (stored[LIBRARY_KEY] as SavedLibrary | undefined) ?? { recipes: [] };
}

async function renderLibrary(): Promise<void> {
  librarySection.hidden = !licensed;
  if (!licensed) return;
  const library = await getLibrary();
  $('#library-count').textContent = `${library.recipes.length} saved`;
  $('#library-empty').hidden = library.recipes.length > 0;
  libraryList.replaceChildren(...library.recipes.map((recipe) => {
    const item = document.createElement('li');
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'library-open';
    open.innerHTML = `<strong></strong><span></span>`;
    open.querySelector('strong')!.textContent = recipe.name;
    open.querySelector('span')!.textContent = recipe.sourceSite;
    open.addEventListener('click', () => {
      assignForm(recipe);
      editor.scrollIntoView({ behavior: 'smooth' });
      announce(`Opened “${recipe.name}” from your local library.`);
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${recipe.name} from library`);
    remove.addEventListener('click', async () => {
      const updated = library.recipes.filter((item) => item.id !== recipe.id);
      await browser.storage.local.set({ [LIBRARY_KEY]: { recipes: updated } });
      announce(`Removed “${recipe.name}” from the local library.`);
      await renderLibrary();
    });
    item.append(open, remove);
    return item;
  }));
}

async function saveToLibrary(): Promise<void> {
  const recipe = readForm();
  if (!recipe) return;
  if (!licensed) {
    $('#restore-panel').setAttribute('open', '');
    $('#plus-heading').scrollIntoView({ behavior: 'smooth' });
    announce('Local library saving is included with Plus. Exports remain free.', 'neutral');
    return;
  }
  const library = await getLibrary();
  const recipes = [recipe, ...library.recipes.filter((item) => item.id !== recipe.id)];
  await browser.storage.local.set({ [LIBRARY_KEY]: { recipes } });
  announce(`Saved “${recipe.name}” to this device.`, 'success');
  await renderLibrary();
}

async function setLicenseState(valid: boolean, message?: string): Promise<void> {
  licensed = valid;
  $('#license-state').textContent = message ?? (valid ? 'Plus active on this device' : '$12 once · no account required');
  $('#save-library').textContent = valid ? 'Save to local library' : 'Save to library · Plus';
  await renderLibrary();
}

async function checkStoredLicense(): Promise<void> {
  const stored = await browser.storage.local.get([LICENSE_KEY, LICENSE_CACHE_KEY]);
  const token = stored[LICENSE_KEY] as string | undefined;
  const record = stored[LICENSE_CACHE_KEY] as StoredLicense | undefined;
  await setLicenseState(Boolean(token && record?.valid));
  if (!token || !shouldVerify({ ...record, token } as StoredLicense)) return;
  if (!navigator.onLine) {
    $('#license-state').textContent = record?.valid ? 'Plus active · verification waits for internet' : 'Offline · license not checked yet';
    return;
  }
  try {
    const valid = await verifyLicense(token);
    await browser.storage.local.set({ [LICENSE_CACHE_KEY]: { token, valid, checkedAt: Date.now() } satisfies StoredLicense });
    await setLicenseState(valid, valid ? 'Plus active on this device' : 'License no longer active · exports remain free');
  } catch {
    $('#license-state').textContent = record?.valid ? 'Plus active · could not refresh license' : 'Could not reach the license service';
  }
}

async function restoreLicense(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const token = $<HTMLInputElement>('#license').value.trim();
  if (!token) return announce('Paste the license token from your receipt.', 'error');
  const button = $<HTMLButtonElement>('#license-form button');
  button.disabled = true;
  button.textContent = 'Verifying…';
  try {
    const valid = await verifyLicense(token);
    const record = { token, valid, checkedAt: Date.now() } satisfies StoredLicense;
    await browser.storage.local.set({ [LICENSE_KEY]: token, [LICENSE_CACHE_KEY]: record });
    await setLicenseState(valid, valid ? 'Plus active on this device' : 'That license is not active');
    announce(valid ? 'Plus unlocked. Your library stays in browser storage.' : 'The license could not be verified. Check the token and try again.', valid ? 'success' : 'error');
  } catch {
    announce('The license service could not be reached. Your free tools still work.', 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Verify license';
  }
}

captureButton.addEventListener('click', () => void capture());
choice.addEventListener('change', () => assignForm(candidates[Number(choice.value)]!));
recipeForm.addEventListener('input', () => {
  const recipe = readForm();
  if (recipe) void browser.storage.local.set({ [DRAFT_KEY]: recipe });
});
$('#export-md').addEventListener('click', () => {
  const recipe = readForm();
  if (recipe) download(recipeAsMarkdown(recipe), 'md', 'text/markdown');
});
$('#export-json').addEventListener('click', () => {
  const recipe = readForm();
  if (recipe) download(recipeAsJson(recipe), 'json', 'application/json');
});
$('#save-library').addEventListener('click', () => void saveToLibrary());
$('#license-form').addEventListener('submit', (event) => void restoreLicense(event as SubmitEvent));
$('#buy-link').setAttribute('href', CHECKOUT_URL);

window.addEventListener('online', () => {
  announce('Back online. Recipe capture remains local.', 'success');
  void checkStoredLicense();
});
window.addEventListener('offline', () => announce('You are offline. Capture and export still work on loaded pages; license checks will wait.'));

void (async () => {
  const queryLicense = new URL(location.href).searchParams.get('license');
  if (queryLicense) {
    await browser.storage.local.set({ [LICENSE_KEY]: queryLicense });
    history.replaceState({}, '', location.pathname);
  }
  const stored = await browser.storage.local.get(DRAFT_KEY);
  const draft = stored[DRAFT_KEY] as RecipeDraft | undefined;
  if (draft) {
    assignForm(draft);
    pageState.textContent = `Draft restored from ${draft.sourceSite}. Capture again to replace it.`;
  }
  if (!navigator.onLine) announce('Offline. Loaded pages can still be captured and exported; license checks will wait.');
  await checkStoredLicense();
})();
