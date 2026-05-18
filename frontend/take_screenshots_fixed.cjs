const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseDir = path.join('C:', 'Users', 'Microsoft', 'Downloads', 'justmarrakech', 'preuves_corrections');
const bug1Dir = path.join(baseDir, 'bug1_avis_filtres');
const bug2Dir = path.join(baseDir, 'bug2_dashboard_sauvegarde');

(async () => {
    // Launch browser with a large viewport to see everything
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    console.log("Démarrage de la capture d'écran...");

    // ==========================================
    // BUG 1: AVIS CLIENTS (REVIEWS)
    // ==========================================
    console.log("Test 1: Avis Clients...");
    
    // Allez sur la page d'une activité avec des avis (Quad Palmeraie)
    await page.goto('http://localhost:5173/activities/experiences/quad-palmeraie-marrakech', { waitUntil: 'networkidle' });
    
    // Attendre que la section des avis soit visible
    try {
        await page.waitForSelector('h2:has-text("Avis")', { timeout: 10000 });
        // Scroll specifically to the reviews section
        const reviewsLocator = page.locator('h2:has-text("Avis")');
        await reviewsLocator.scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000); // Wait for animations
        // Take a full page screenshot to ensure we capture the whole context
        await page.screenshot({ path: path.join(bug1Dir, '1_quad_avec_avis_specifiques.png'), fullPage: true });
        console.log("✅ Capture Quad réussie.");
    } catch (e) {
        console.log("Erreur section avis Quad:", e.message);
        await page.screenshot({ path: path.join(bug1Dir, '1_quad_erreur.png'), fullPage: true });
    }

    // Allez sur une autre activité pour vérifier qu'elle a d'autres avis ou est vide
    await page.goto('http://localhost:5173/activities/bien-etre/hammam-gueliz', { waitUntil: 'networkidle' });
    try {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(bug1Dir, '2_hammam_sans_avis_quad.png'), fullPage: true });
        console.log("✅ Capture Hammam réussie.");
    } catch (e) {
        console.log("Erreur Hammam:", e.message);
    }


    // ==========================================
    // BUG 2: DASHBOARD ADMIN SAUVEGARDE
    // ==========================================
    console.log("Test 2: Dashboard Admin...");
    
    // Login
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@justmarrakech.com');
    await page.fill('input[type="password"]', 'admin123');
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click('button[type="submit"]')
    ]);
    
    // Check if we are on dashboard
    if (page.url().includes('login')) {
        console.log("❌ La connexion a échoué! Capture de l'erreur...");
        await page.screenshot({ path: path.join(bug2Dir, 'erreur_login.png') });
    } else {
        console.log("✅ Connexion réussie!");
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(bug2Dir, '1_dashboard_accueil.png') });

        // Navigate to categories
        console.log("Ouverture des catégories...");
        await page.click('button:has-text("CATÉGORIES"), button:has-text("Catégories")');
        await page.waitForTimeout(3000); // Wait for API to load data
        
        await page.screenshot({ path: path.join(bug2Dir, '2_liste_categories.png') });

        // Click Edit on the first category (Bien-Etre)
        console.log("Ouverture du modal d'édition...");
        await page.click('tbody tr:first-child button.text-blue-600, tbody tr:first-child button');
        await page.waitForTimeout(2000); // Wait for modal to open
        
        // Take screenshot of the modal specifically showing badges
        await page.screenshot({ path: path.join(bug2Dir, '3_preuve_sauvegarde_badges.png') });
        console.log("✅ Capture des badges réussie.");
    }

    await browser.close();
    console.log("Terminé!");
})();
