import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X size
    locale: 'ar-SA',
  });
  const page = await context.newPage();

  try {
    // 1. Navigate to Arabic home page
    console.log('📸 Taking screenshot 1: Arabic home page...');
    await page.goto('http://localhost:3002/ar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Wait for animations
    await page.screenshot({ path: join(__dirname, 'screenshot-1-home.png'), fullPage: true });
    console.log('✅ Screenshot 1 saved: screenshot-1-home.png');

    // 2. Click on Morning Azkar (first period card)
    console.log('📸 Taking screenshot 2: Morning Azkar list...');
    await page.click('button:has-text("أذكار الصباح")');
    await page.waitForTimeout(1500); // Wait for navigation and animations
    await page.screenshot({ path: join(__dirname, 'screenshot-2-morning-azkar.png'), fullPage: true });
    console.log('✅ Screenshot 2 saved: screenshot-2-morning-azkar.png');

    // 3. Go back and click Counter tab
    console.log('📸 Taking screenshot 3: Counter page...');
    await page.goto('http://localhost:3002/ar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.click('a[href="/ar/counter"]');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(__dirname, 'screenshot-3-counter.png'), fullPage: true });
    console.log('✅ Screenshot 3 saved: screenshot-3-counter.png');

    // 4. Click Settings tab
    console.log('📸 Taking screenshot 4: Settings page...');
    await page.click('a[href="/ar/settings"]');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(__dirname, 'screenshot-4-settings.png'), fullPage: true });
    console.log('✅ Screenshot 4 saved: screenshot-4-settings.png');

    console.log('\n✨ All screenshots captured successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
