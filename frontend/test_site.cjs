const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let errors = [];
  page.on('pageerror', error => {
    errors.push(`Page error: ${error.message}`);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`);
    }
  });

  console.log('Testing Homepage...');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(3000); // let animations run
  await page.screenshot({ path: 'home.png', fullPage: true });

  console.log('Testing Activities...');
  await page.goto('http://localhost:5173/activities');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'activities.png', fullPage: true });

  console.log('Testing Sur Mesure...');
  await page.goto('http://localhost:5173/sur-mesure');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'surmesure.png', fullPage: true });

  console.log('Testing Blog...');
  await page.goto('http://localhost:5173/blog');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'blog.png', fullPage: true });

  // Try fetching an English version
  console.log('Testing English Homepage...');
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    // Attempt to trigger language change via local storage and reload
    localStorage.setItem('i18nextLng', 'en');
  });
  await page.reload();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'home_en.png', fullPage: true });

  await browser.close();

  if (errors.length > 0) {
    console.log('Errors found:');
    errors.forEach(e => console.log(e));
  } else {
    console.log('All tests passed without console errors.');
  }
})();
