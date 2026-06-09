#!/usr/bin/env node
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:5174';

const SHOTS = [
  { name: 'dashboard', label: 'Dashboard', action: null },
  { name: 'portfolio', label: 'Portfolio', action: async (p) => { await p.click('button:has-text("Portfolio")'); } },
  { name: 'demand', label: 'Demand Intake', action: async (p) => {
    await p.click('button:has-text("Demand")');
    await p.waitForTimeout(600);
    // Click Change Status on first demand to show popup
    const btn = p.locator('button:has-text("Change Status")').first();
    if (await btn.isVisible()) { await btn.click(); await p.waitForTimeout(300); }
  }},
  { name: 'products', label: 'Products', action: async (p) => { await p.click('button:has-text("Products")'); }},
  { name: 'epics', label: 'Epics', action: async (p) => { await p.click('button:has-text("Epics")'); }},
  { name: 'sprints', label: 'Sprints', action: async (p) => { await p.click('button:has-text("Sprints")'); }},
  { name: 'releases', label: 'Releases', action: async (p) => {
    await p.click('button:has-text("Releases")');
    await p.waitForTimeout(500);
    // Click first release row to expand
    const row = p.locator('tr.project-main-row').first();
    if (await row.isVisible()) { await row.click(); await p.waitForTimeout(300); }
  }},
  { name: 'governance', label: 'Governance', action: async (p) => { await p.click('button:has-text("Governance")'); }},
  { name: 'risks', label: 'Risks', action: async (p) => { await p.click('button:has-text("Risks")'); }},
  { name: 'users', label: 'Users', action: async (p) => { await p.click('button:has-text("Users")'); }},
  { name: 'config', label: 'Config', action: async (p) => { await p.click('button:has-text("Config")'); }},
];

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500); // Let data seed + UI render

    for (const shot of SHOTS) {
      console.log(`📸 Capturing: ${shot.name} (${shot.label})...`);
      
      if (shot.action) {
        await shot.action(page);
        await page.waitForTimeout(800);
      }

      const filePath = path.join(OUTPUT_DIR, `${shot.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`   ✅ Saved: ${shot.name}.png`);
    }

    console.log(`\n🎉 Done! ${SHOTS.length} screenshots saved to ${OUTPUT_DIR}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
