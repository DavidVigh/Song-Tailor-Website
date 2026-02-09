//npx playwright test

import { test, expect } from '@playwright/test';

test('User can submit a song request', async ({ page }) => {
  // 1. Go to the page
  await page.goto('https://song-tailor-website.vercel.app/pages/request');

  // 2. Fill out the text fields (Playwright found these for you!)
  await page.getByPlaceholder('Song Title').fill('Playwright Auto-Test');
  await page.getByPlaceholder('Describe your idea...').fill('Testing the ghost user functionality.');
  await page.getByPlaceholder('Budget (FT)').fill('5000');

  // 3. Select Genre (Example - adjust based on your actual UI)
  // If you clicked a "Rock" button during recording, it will appear here.
  await page.getByRole('button', { name: 'Rock & Roll' }).click();

  // 4. Add a Track
  await page.getByPlaceholder('Paste YouTube Link').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await page.getByRole('button', { name: 'Add' }).click();

  // 5. Submit
  await page.getByRole('button', { name: 'Submit Request' }).click();

  // 6. The "Proof"
  // This line checks if the "Success" message appeared.
  await expect(page.getByText('Request Submitted')).toBeVisible();
});