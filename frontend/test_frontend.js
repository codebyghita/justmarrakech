import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'home_fr.png', fullPage: true });
    console.log('Saved home_fr.png');

    console.log('Switching to English...');
    // The language switcher in Navbar.jsx usually has the text "EN"
    const enButton = await page.locator('button:has-text("EN")').first();
    if (await enButton.isVisible()) {
        await enButton.click();
        await page.waitForTimeout(2000); // wait for translations to load
        await page.screenshot({ path: 'home_en.png', fullPage: true });
        console.log('Saved home_en.png');
    }

    console.log('Switching to Arabic...');
    const arButton = await page.locator('button:has-text("AR")').first();
    if (await arButton.isVisible()) {
        await arButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'home_ar.png', fullPage: true });
        console.log('Saved home_ar.png');
    }

  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    await browser.close();
  }
})();
