import fs from 'fs';

import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 20000,
  video: false,
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on) {
      // Route Chrome/Blink/V8 logs to a file so the fatal `Check failed:` line
      // lands somewhere we can read. --no-sandbox lets the renderer write it.
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--enable-logging');
          launchOptions.args.push('--log-file=/tmp/vl-repro-chrome.log');
          launchOptions.args.push('--v=1');
          try {
            fs.writeFileSync('/tmp/vl-repro-chrome.log', '');
          } catch {
            /* ignore */
          }
        }
        return launchOptions;
      });
    },
  },
});
