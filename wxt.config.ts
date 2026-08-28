import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  manifest: {
    name: 'Recipe Source Card',
    short_name: 'Source Card',
    description: 'Capture editable recipe cards from visible Recipe JSON-LD, with the source kept attached.',
    version: '1.0.0',
    permissions: ['activeTab', 'scripting', 'storage'],
    host_permissions: ['https://pilot-api.sociobot.in/*'],
    action: {
      default_title: 'Capture recipe source card',
    },
    commands: {
      _execute_action: {
        suggested_key: { default: 'Ctrl+Shift+Y', mac: 'Command+Shift+Y' },
        description: 'Open Recipe Source Card',
      },
    },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
});
