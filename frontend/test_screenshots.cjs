const { chromium } = require('playwright');

(async () => {
  console.log("Starting screenshot generation...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // LOGIN
  console.log("Logging in...");
  await page.goto('http://localhost:5173/admin');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', 'admin@justmarrakech.com');
  await page.fill('input[type="password"]', 'marrakech2026');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin**', { timeout: 10000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'proof_01_logged_in.png', fullPage: true });

  // TEST REVIEWS ON ACTIVITY PAGE (ID 43 - HAS REVIEW)
  console.log("Checking activity 43 (should have review)...");
  await page.goto('http://localhost:5173/detail/activity/43', { waitUntil: 'networkidle' });
  // Scroll to bottom to trigger any lazy loading and ensure full page screenshot gets everything
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(4000); 
  await page.screenshot({ path: 'proof_02_reviews_activity_43.png', fullPage: true });

  // TEST REVIEWS ON ACTIVITY PAGE (ID 61 - NO REVIEW, because ID 1 does not exist in the DB)
  console.log("Checking activity 61 (should NOT have review)...");
  await page.goto('http://localhost:5173/detail/activity/61', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'proof_03_reviews_activity_1_should_be_empty.png', fullPage: true });

  await browser.close();
  console.log('Done - check proof_01, proof_02, proof_03 screenshots');
})();
