import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. ADMIN TEST
    console.log('--- ADMIN PANEL TEST ---');
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
    
    // Login
    await page.fill('input[type="email"]', 'admin@justmarrakech.com');
    await page.fill('input[type="password"]', 'marrakech2024');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'admin_dashboard.png', fullPage: true });
    console.log('Logged in to Admin.');

    // Click "Page Accueil"
    await page.click('button:has-text("Page Accueil")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'admin_page_accueil.png', fullPage: true });
    console.log('Clicked Page Accueil.');

    // 2. CLIENT SIDE TEST - TRANSLATIONS
    console.log('--- CLIENT SIDE TEST ---');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Extract French hero title
    const frTitle = await page.textContent('h1');
    console.log('FR Hero Title:', frTitle.trim());

    // Switch to English
    await page.click('div.group:has(svg.lucide-globe)'); // Hover over language switcher
    await page.waitForTimeout(500);
    await page.click('button:has-text("English")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'client_en_home.png', fullPage: true });
    const enTitle = await page.textContent('h1');
    console.log('EN Hero Title:', enTitle.trim());

    // Check Excursions page in English
    await page.goto('http://localhost:5173/excursions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'client_en_excursions.png', fullPage: true });
    const enExcursionHero = await page.textContent('h1');
    console.log('EN Excursions Hero:', enExcursionHero.trim());

  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    await browser.close();
  }
})();
