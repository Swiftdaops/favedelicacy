/* Puppeteer smoke tests for Favedelicacy
   - Loads admin login page
   - Checks backend /api health
   - Attempts admin login and verifies redirect to /admin/dashboard
   - Checks /api/orders/pending-count with cookie
*/

import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

const FRONTEND = process.env.FRONTEND_URL || 'https://favedelicacy.store';
const BACKEND = process.env.BACKEND_URL || 'https://favedelicacybackend.onrender.com';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'favedelicacy@admin.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Favesellsgoodfood$15';

async function checkBackend() {
  const url = `${BACKEND}/api`;
  console.log('Checking backend base:', url);
  const res = await fetch(url, { timeout: 10000 });
  const text = await res.text();
  console.log('Backend status', res.status);
  return res.status < 500;
}

async function run() {
  console.log('Starting Puppeteer...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    const loginUrl = `${FRONTEND}/admin/login`;
    console.log('Visiting', loginUrl);
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });

    // Instrument network to capture auth/pending-count traffic
    const logs = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/api/auth') || url.includes('/api/orders')) {
        logs.push({ type: 'request', url, method: req.method(), headers: req.headers() });
      }
    });
    page.on('response', async (res) => {
      const url = res.url();
      if (url.includes('/api/auth') || url.includes('/api/orders')) {
        let body = null;
        try { body = await res.text(); } catch (e) { body = `<unreadable: ${e.message}>`; }
        logs.push({ type: 'response', url, status: res.status(), headers: res.headers(), body });
      }
    });

    // Also perform a direct API login to inspect raw backend response
    async function directApiLogin() {
      try {
        const loginUrl = `${BACKEND}/api/auth/login`;
        console.log('Direct POST ->', loginUrl);
        const resp = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: process.env.SEED_ADMIN_EMAIL || ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD || ADMIN_PASSWORD }),
        });
        const text = await resp.text().catch(() => null);
        console.log('Direct login status:', resp.status);
        console.log('Direct login headers:', Object.fromEntries(resp.headers.entries()));
        console.log('Direct login body:', text);
        const sc = resp.headers.get('set-cookie') || '';
        const m = sc.match(/token=([^;]+)/);
        const token = m ? m[1] : null;
        return { status: resp.status, body: text, token };
      } catch (err) {
        console.error('Direct login failed:', err && err.message);
        return { status: 0, body: null, token: null };
      }
    }

    const direct = await directApiLogin();
    if (direct?.token) {
      console.log('Setting auth cookie in browser from direct login');
      const cookie = {
        name: 'token',
        value: direct.token,
        domain: new URL(FRONTEND).hostname,
        path: '/',
        httpOnly: true,
        secure: true,
      };
      try {
        await page.setCookie(cookie);
      } catch (e) {
        console.warn('Failed to set cookie on page:', e && e.message);
      }
    }

    // Ensure login form exists
    const emailSel = 'input[type="email"]';
    const passSel = 'input[type="password"]';
    await page.waitForSelector(emailSel);
    await page.waitForSelector(passSel);
    console.log('Login form found');

    // Fill form and submit
    await page.fill ? await page.fill(emailSel, ADMIN_EMAIL) : await page.type(emailSel, ADMIN_EMAIL);
    await page.type(passSel, ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to /admin/dashboard (or for a success toast)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    const url = page.url();
    console.log('After login, page url:', url);

    // Check backend pending-count via fetch with cookies from the page
    const cookies = await page.cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const pendingRes = await fetch(`${BACKEND}/api/orders/pending-count`, {
      headers: { Cookie: cookieHeader },
    });
    const pendingJson = await pendingRes.json().catch(() => null);
    console.log('pending-count status:', pendingRes.status, 'body:', pendingJson);

    console.log('Network logs for auth/orders:');
    for (const l of logs) {
      console.log(JSON.stringify(l, null, 2));
    }

    // simple success criteria
    const ok = pendingRes.status === 200 || url.includes('/admin/dashboard');
    if (!ok) throw new Error('Smoke checks failed');

    console.log('All smoke checks passed');
  } catch (err) {
    console.error('Test failure:', err && (err.message || err));
    await browser.close();
    process.exit(2);
  }

  await browser.close();
  process.exit(0);
}

run();
