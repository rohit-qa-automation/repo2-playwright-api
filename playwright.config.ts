import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';
import 'dotenv/config';

const isCI = !!process.env.CI;

const reporter: PlaywrightTestConfig['reporter'] = isCI
  ? [
      ['github'],
      ['list'],
      ['html', { open: 'never' }],
      ['allure-playwright', { resultsDir: 'allure-results' }],
    ]
  : [
      ['list'],
      ['html', { open: 'never' }],
      ['allure-playwright', { resultsDir: 'allure-results' }],
    ];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // The public demo API runs on a free host and can be slow to wake up.
  retries: isCI ? 2 : 1,
  workers: 4,
  timeout: 30_000,
  reporter,
  use: {
    baseURL: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
    extraHTTPHeaders: { Accept: 'application/json' },
  },
  // No browsers needed: every test uses Playwright's `request` API client.
  projects: [{ name: 'api' }],
});
