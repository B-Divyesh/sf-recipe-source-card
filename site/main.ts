const PRODUCT = 'recipe-source-card';
const LICENSE_KEY = `sb_license:${PRODUCT}`;
const query = new URLSearchParams(location.search);
const returnedLicense = query.get('license');

if (returnedLicense) {
  localStorage.setItem(LICENSE_KEY, returnedLicense);
  history.replaceState({}, '', `${location.pathname}${location.hash}`);
}

const form = document.querySelector<HTMLFormElement>('#restore-form');
const input = document.querySelector<HTMLInputElement>('#license');
const message = document.querySelector<HTMLElement>('#license-message');

if (input) input.value = localStorage.getItem(LICENSE_KEY) ?? '';
if (returnedLicense && message) {
  message.textContent = 'License saved in this browser. Paste it into the extension’s Restore panel to unlock Plus there.';
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const token = input?.value.trim();
  if (!token || !message) return;
  localStorage.setItem(LICENSE_KEY, token);
  message.textContent = 'Saved here. Open the extension and paste this token under “Have a license?” to verify Plus.';
});

if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
}
