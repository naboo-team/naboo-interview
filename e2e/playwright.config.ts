import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  testDir: './tests',
  projects: [
    {
      name: 'app',
      testMatch: '**/*.spec.ts',
      use: {
        baseURL: `http://localhost:3001`,
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        bypassCSP: true,
        browserName: 'chromium',
      },
    },
  ],
})
