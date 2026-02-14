import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    locale: 'ar-SA',
  });
  const page = await context.newPage();

  // Collect console logs and errors
  const consoleLogs = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(`Page Error: ${error.message}`);
  });

  try {
    // 1. Navigate to Morning Azkar list
    console.log('📱 Navigating to Morning Azkar list page...');
    await page.goto('http://localhost:3002/ar/azkar/morning', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    await page.waitForTimeout(2000); // Wait for any animations/data loading

    // Check if there are any azkar cards
    const azkarCards = await page.$$('[class*="cursor-pointer"]');
    console.log(`✅ Found ${azkarCards.length} azkar cards on the page`);

    // Take screenshot of list page
    await page.screenshot({ 
      path: join(__dirname, 'screenshot-azkar-list.png'), 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: screenshot-azkar-list.png');

    // Check for specific elements
    const hasTitle = await page.$('text=/أذكار/');
    const hasArabicText = await page.$('text=/اللهم/');
    console.log(`Title present: ${!!hasTitle}`);
    console.log(`Arabic text present: ${!!hasArabicText}`);

    // 2. Click on first zikr card if available
    if (azkarCards.length > 0) {
      console.log('\n🖱️  Clicking on first zikr card...');
      await azkarCards[0].click();
      await page.waitForTimeout(2000); // Wait for navigation and animations

      // Check for counter circle on detail page
      const hasCounter = await page.$('text=/مرات/');
      const hasCircle = await page.$$('circle');
      console.log(`Counter text present: ${!!hasCounter}`);
      console.log(`SVG circles found: ${hasCircle.length}`);

      await page.screenshot({ 
        path: join(__dirname, 'screenshot-azkar-detail.png'), 
        fullPage: true 
      });
      console.log('📸 Screenshot saved: screenshot-azkar-detail.png');
    } else {
      console.log('⚠️  No azkar cards found to click');
    }

    // Report console errors
    console.log('\n📋 Console Log Summary:');
    console.log(`Total console messages: ${consoleLogs.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors Found:');
      consoleErrors.forEach((err, i) => {
        console.log(`${i + 1}. ${err}`);
      });
    } else {
      console.log('✅ No console errors detected');
    }

    // Show last 10 console logs for context
    if (consoleLogs.length > 0) {
      console.log('\n📝 Recent Console Logs (last 10):');
      consoleLogs.slice(-10).forEach(log => console.log(log));
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    await page.screenshot({ 
      path: join(__dirname, 'screenshot-error.png'), 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();
