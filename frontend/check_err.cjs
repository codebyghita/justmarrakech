const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('CRASH: ' + err.message));
  page.on('console', msg => console.log('LOG: ' + msg.text()));
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  await browser.close();
})();
