const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const urls = ['http://127.0.0.1:3000/login', 'http://127.0.0.1:3000'];
  for (const u of urls) {
    try {
      await page.goto(u, { waitUntil: 'networkidle', timeout: 15000 });
      if ((await page.locator('input[type="password"]').count()) > 0) break;
    } catch {}
  }

  const username = '901234567';
  const password = 'admin';

  const userSelectors = [
    'input[name="phone"]',
    'input[name="username"]',
    'input[name="email"]',
    'input[type="tel"]',
    'input[type="text"]',
    'input[type="number"]',
    'input:not([type="password"])'
  ];

  let filledUser = false;
  for (const sel of userSelectors) {
    const loc = page.locator(sel).first();
    if (await loc.count()) {
      try {
        await loc.fill(username);
        filledUser = true;
        break;
      } catch {}
    }
  }

  const passLoc = page.locator('input[type="password"], input[name="password"]').first();
  if (await passLoc.count()) {
    await passLoc.fill(password);
  }

  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Kirish")',
    'button:has-text("Login")',
    'button:has-text("Sign in")',
    'text=Kirish',
    'text=Login'
  ];

  let clicked = false;
  for (const sel of submitSelectors) {
    const btn = page.locator(sel).first();
    if (await btn.count()) {
      try {
        await Promise.all([
          page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {}),
          btn.click({ timeout: 3000 })
        ]);
        clicked = true;
        break;
      } catch {}
    }
  }

  if (!clicked && filledUser) {
    await page.keyboard.press('Enter').catch(() => {});
    await page.waitForTimeout(2000);
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/home/fedora/.openclaw/workspace/ibox-login.png', fullPage: true });
  await browser.close();
})();
