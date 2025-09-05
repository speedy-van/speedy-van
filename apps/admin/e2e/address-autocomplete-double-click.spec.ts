import { test, expect } from '@playwright/test';

test.describe('AddressAutocomplete Double-Click Fix', () => {
  test('should select address with single click', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/book');

    // Wait for the booking form to load
    await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();

    // Find the pickup address input
    const pickupInput = page.locator('[data-testid="pickup-address"]');
    await expect(pickupInput).toBeVisible();

    // Type to trigger autocomplete
    await pickupInput.fill('123 Oxford Street');

    // Wait for autocomplete suggestions to appear
    await page.waitForTimeout(500); // Wait for debounce

    // Look for autocomplete menu
    const autocompleteMenu = page.locator('.autocomplete-menu');

    // If suggestions appear, test single click selection
    if (await autocompleteMenu.isVisible()) {
      const firstSuggestion = autocompleteMenu.locator('li').first();
      await expect(firstSuggestion).toBeVisible();

      // Click once on the first suggestion
      await firstSuggestion.click();

      // Verify that the address was selected (input should be filled)
      const inputValue = await pickupInput.inputValue();
      expect(inputValue).toBeTruthy();
      expect(inputValue.length).toBeGreaterThan(0);

      // Verify that the autocomplete menu is closed
      await expect(autocompleteMenu).not.toBeVisible();
    }
  });

  test('should not require double click for address selection', async ({
    page,
  }) => {
    // Navigate to booking page
    await page.goto('/book');

    // Wait for the booking form to load
    await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();

    // Find the dropoff address input
    const dropoffInput = page.locator('[data-testid="dropoff-address"]');
    await expect(dropoffInput).toBeVisible();

    // Type to trigger autocomplete
    await dropoffInput.fill('456 Regent Street');

    // Wait for autocomplete suggestions to appear
    await page.waitForTimeout(500); // Wait for debounce

    // Look for autocomplete menu
    const autocompleteMenu = page.locator('.autocomplete-menu');

    // If suggestions appear, test that single click works
    if (await autocompleteMenu.isVisible()) {
      const suggestions = autocompleteMenu.locator('li');
      const suggestionCount = await suggestions.count();

      if (suggestionCount > 0) {
        const firstSuggestion = suggestions.first();

        // Get the text of the first suggestion
        const suggestionText = await firstSuggestion
          .locator('div')
          .first()
          .textContent();

        // Click once on the first suggestion
        await firstSuggestion.click();

        // Verify that the address was selected with the correct text
        const inputValue = await dropoffInput.inputValue();
        expect(inputValue).toBe(suggestionText);

        // Verify that the autocomplete menu is closed
        await expect(autocompleteMenu).not.toBeVisible();
      }
    }
  });

  test('should handle keyboard navigation correctly', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/book');

    // Wait for the booking form to load
    await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();

    // Find the pickup address input
    const pickupInput = page.locator('[data-testid="pickup-address"]');
    await expect(pickupInput).toBeVisible();

    // Type to trigger autocomplete
    await pickupInput.fill('789 Piccadilly');

    // Wait for autocomplete suggestions to appear
    await page.waitForTimeout(500); // Wait for debounce

    // Look for autocomplete menu
    const autocompleteMenu = page.locator('.autocomplete-menu');

    // If suggestions appear, test keyboard navigation
    if (await autocompleteMenu.isVisible()) {
      // Press Arrow Down to select first item
      await pickupInput.press('ArrowDown');

      // Verify that the first item is highlighted
      const firstSuggestion = autocompleteMenu.locator('li').first();
      await expect(firstSuggestion).toHaveClass(/active/);

      // Press Enter to select
      await pickupInput.press('Enter');

      // Verify that the address was selected
      const inputValue = await pickupInput.inputValue();
      expect(inputValue).toBeTruthy();

      // Verify that the autocomplete menu is closed
      await expect(autocompleteMenu).not.toBeVisible();
    }
  });
});
