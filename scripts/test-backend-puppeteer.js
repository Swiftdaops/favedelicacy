#!/usr/bin/env node
const puppeteer = require('puppeteer');

(async () => {
  const backend = 'https://favedelicacybackend.onrender.com';
  const endpoints = ['/', '/api', '/health', '/api/health', '/status'];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const ep of endpoints) {
    const url = backend.replace(/\/$/, '') + ep;
    console.log('\nTesting', url);
    const result = await page.evaluate(async (url) => {
      try {
        const res = await fetch(url, { method: 'GET', credentials: 'omit' });
        let text = '';
        try { text = await res.text(); } catch(e) { text = '<unreadable body>'; }
        return { status: res.status, ok: res.ok, bodySnippet: text.slice(0, 500) };
      } catch (e) {
        return { error: e.message };
      }
    }, url);
    console.log(result);
  }

  await browser.close();
})();
