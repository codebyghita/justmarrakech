const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseDir = path.join('C:', 'Users', 'Microsoft', 'Downloads', 'justmarrakech', 'preuves_corrections');
const bug1Dir = path.join(baseDir, 'bug1_avis_filtres');
const bug2Dir = path.join(baseDir, 'bug2_dashboard_sauvegarde');

// Create directories
[bug1Dir, bug2Dir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1024 }
    });
    const page = await context.newPage();

    console.log("=== Taking Screenshots for Bug 1 (Reviews Filter) ===");
    
    // Activity 1
    console.log("Navigating to Activity 1...");
    await page.goto('http://localhost:5173/activities/experiences/quad-palmeraie-marrakech', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Scroll to bottom to see reviews
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(bug1Dir, '1_activity_quad_reviews.png') });
    console.log("Saved 1_activity_quad_reviews.png");

    // Activity 2
    console.log("Navigating to Activity 2...");
    await page.goto('http://localhost:5173/activities/bien-etre/hammam-gueliz', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Scroll to bottom to see reviews
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(bug1Dir, '2_activity_hammam_reviews.png') });
    console.log("Saved 2_activity_hammam_reviews.png");


    console.log("\n=== Taking Screenshots for Bug 2 (Admin Dashboard Badges) ===");
    
    // Login
    console.log("Logging into Admin Dashboard...");
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@justmarrakech.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(bug2Dir, '1_dashboard_logged_in.png') });
    console.log("Saved 1_dashboard_logged_in.png");

    // Go to categories view directly
    console.log("Navigating to Categories view...");
    await page.evaluate(() => {
        // Find the Categories button in the sidebar and click it
        const buttons = Array.from(document.querySelectorAll('button'));
        const catBtn = buttons.find(b => b.textContent.includes('CATÉGORIES') || b.textContent.includes('Categories') || b.textContent.includes('Catégories'));
        if (catBtn) catBtn.click();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(bug2Dir, '2_categories_list.png') });
    console.log("Saved 2_categories_list.png");

    // Open first edit modal
    console.log("Opening edit modal to show badges...");
    await page.evaluate(() => {
        // Find edit buttons (usually SVG icons in a table)
        const trs = document.querySelectorAll('tbody tr');
        if (trs.length > 0) {
            const editBtn = trs[0].querySelector('button.text-blue-600') || trs[0].querySelector('button');
            if (editBtn) editBtn.click();
        }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(bug2Dir, '3_category_edit_badges.png') });
    console.log("Saved 3_category_edit_badges.png");

    await browser.close();
    console.log("Done!");
})();
