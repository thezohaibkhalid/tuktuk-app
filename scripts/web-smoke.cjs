const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const url = process.env.MOBILE_TEST_URL;
  assert(url, 'Set MOBILE_TEST_URL to the locally served Expo web export');
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(url);
      const clippedLabels = await page.getByRole('tab').evaluateAll(tabs => tabs.flatMap(tab =>
        Array.from(tab.querySelectorAll('[dir]')).filter(label => {
          const style = getComputedStyle(label);
          return style.overflow === 'hidden' && label.getBoundingClientRect().height < parseFloat(style.fontSize);
        }).map(label => label.textContent),
      ));
      assert.deepEqual(clippedLabels, [], 'Tab labels must not be clipped');
      await page.getByRole('tab', { name: 'Account' }).click();
      await page.getByText('Sign in to your account', { exact: true }).waitFor();
      await page.getByText('Sign in', { exact: true }).click();
      await page.getByLabel('Email', { exact: true }).waitFor();
      assert.equal(await page.locator('input').count(), 2);
      if (process.env.MOBILE_TEST_EMAIL && process.env.MOBILE_TEST_PASSWORD) {
        let expired = false;
        await page.route('**/auth/me', async route => {
          if (!expired) {
            expired = true;
            await route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":{"message":"Expired test access token"}}' });
          } else {
            await route.continue();
          }
        });
        await page.getByLabel('Email', { exact: true }).fill(process.env.MOBILE_TEST_EMAIL);
        await page.getByLabel('Password', { exact: true }).fill(process.env.MOBILE_TEST_PASSWORD);
        const [login, refresh] = await Promise.all([
          page.waitForResponse(response => response.url().endsWith('/auth/login') && response.request().method() === 'POST'),
          page.waitForResponse(response => response.url().endsWith('/auth/refresh') && response.request().method() === 'POST'),
          page.getByRole('button', { name: 'Sign in', exact: true }).click(),
        ]);
        assert.equal(login.status(), 200);
        assert.equal(refresh.status(), 200);
        const loginTokens = (await login.json()).data;
        const refreshedTokens = (await refresh.json()).data;
        assert.notEqual(refreshedTokens.refreshToken, loginTokens.refreshToken, 'Refresh rotation must issue a unique token');
        await page.getByText(process.env.MOBILE_TEST_EMAIL, { exact: true }).waitFor();
        assert.equal(await page.evaluate(() => localStorage.getItem('tuktuk_access_token')), null);
        page.once('dialog', dialog => dialog.accept());
        const [logout] = await Promise.all([
          page.waitForResponse(response => response.url().endsWith('/auth/logout') && response.request().method() === 'POST'),
          page.getByText('Log out', { exact: true }).click(),
        ]);
        assert.equal(logout.status(), 204);
        await page.getByText('Sign in to your account', { exact: true }).waitFor();
        const replay = await page.request.post(refresh.url(), {
          headers: { Cookie: `refresh_token=${refreshedTokens.refreshToken}` },
        });
        assert.equal(replay.status(), 401, 'Logged-out refresh token must be revoked in the backend');
      }
      assert.deepEqual(errors, [], 'Mobile web runtime exceptions');
      if (process.env.MOBILE_TEST_SCREENSHOT_DIR) {
        await page.screenshot({ path: `${process.env.MOBILE_TEST_SCREENSHOT_DIR}/mobile-${viewport.width}.png`, fullPage: true });
      }
      await page.close();
      console.log(`Mobile web smoke passed at ${viewport.width}x${viewport.height}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
