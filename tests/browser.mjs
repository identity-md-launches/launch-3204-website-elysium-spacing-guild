// Optional production-export checks. Playwright is a test tool, not a site dependency.
// IMD_PLAYWRIGHT may point to an installed Playwright index.mjs.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const playwright = await import(process.env.IMD_PLAYWRIGHT
  ? pathToFileURL(resolve(process.env.IMD_PLAYWRIGHT)).href
  : 'playwright');
const engine = process.env.TEST_BROWSER || 'chromium';
assert(['chromium', 'webkit', 'firefox'].includes(engine));
const out = resolve('test/scratch/browser-validation', engine);
await mkdir(out, { recursive: true });
const root = resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (!url.pathname.startsWith('/preview/')) throw new Error('Outside preview');
    const file = resolve(root, decodeURIComponent(url.pathname.slice('/preview/'.length)) || 'index.html');
    if (!file.startsWith(root + sep)) throw new Error('Outside export');
    response.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const results = [];
const errors = [];
let browser;

async function check(name, run) {
  try {
    const detail = await run();
    results.push({ name, passed: true, detail });
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
  }
}

async function inspectLayout(page) {
  return page.evaluate(() => {
    const name = document.querySelector('h1');
    const button = document.querySelector('button');
    const range = document.createRange();
    range.selectNodeContents(name);
    const text = range.getBoundingClientRect();
    const control = button.getBoundingClientRect();
    return {
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      text: { x: text.x, y: text.y, width: text.width, height: text.height },
      control: { x: control.x, y: control.y, width: control.width, height: control.height },
      fontSize: getComputedStyle(name).fontSize,
      image: document.querySelector('img').currentSrc.split('/').pop(),
    };
  });
}

function assertFits(layout) {
  assert(layout.scrollWidth <= layout.width, 'Horizontal overflow');
  for (const [name, box] of Object.entries({ text: layout.text, control: layout.control })) {
    assert(box.x >= -1 && box.x + box.width <= layout.width + 1, `${name} clipped horizontally`);
    assert(box.y >= 0 && box.y + box.height <= layout.height + 1, `${name} outside the first screen`);
  }
  assert(layout.control.width >= 44 && layout.control.height >= 44, 'Small hit target');
}

async function captureContrast(page, id) {
  const layout = await inspectLayout(page);
  const colors = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    const rgb = (css) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = css;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    };
    const button = document.querySelector('button');
    return {
      text: rgb(getComputedStyle(document.querySelector('h1')).color),
      icon: rgb(getComputedStyle(button).color),
      button: rgb(getComputedStyle(button).backgroundColor),
      focus: rgb(getComputedStyle(button).outlineColor),
    };
  });
  await page.locator('h1').evaluate((element) => { element.style.color = 'transparent'; });
  await page.screenshot({ path: `${out}/${id}-background.png` });
  await page.locator('h1').evaluate((element) => { element.style.color = ''; });
  const mask = await page.addStyleTag({ content: 'html,body { background: #000 !important; } .scene__frame,.view-control { visibility: hidden !important; } h1 { color: #fff !important; text-shadow: none !important; -webkit-text-stroke: 0 !important; }' });
  await page.screenshot({ path: `${out}/${id}-mask.png` });
  await mask.evaluate((element) => element.remove());
  await writeFile(`${out}/${id}-contrast.json`, JSON.stringify({ ...layout, colors }, null, 2));
}

try {
  browser = await playwright[engine].launch({ headless: true });
  const viewports = [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 844, height: 390 },
  ];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 500, deviceScaleFactor: 1 });
    await context.route('**/*', (route) => {
      if (route.request().url().startsWith(origin + '/')) return route.continue();
      errors.push(`External request: ${route.request().url()}`);
      return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', (request) => errors.push(`${request.url()} ${request.failure()?.errorText}`));
    await page.goto(origin + '/preview/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const button = page.getByRole('button', { name: 'View station closer' });
    const id = `${viewport.width}x${viewport.height}`;

    await check(`${id}: overview, artwork, only two words, first-screen action`, async () => {
      assert.equal((await page.locator('body').innerText()).trim(), 'elysium guild');
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
      assert.equal(await page.getByRole('button').count(), 1);
      assert(await page.locator('img').evaluate((image) => image.complete && image.naturalWidth > 0));
      assert(await page.evaluate(() => [...document.fonts].some((font) => font.family.includes('Space Grotesk') && font.status === 'loaded')));
      const layout = await inspectLayout(page);
      assertFits(layout);
      assert.equal(layout.image.includes('portrait'), viewport.width / viewport.height <= 3 / 4);
      await page.screenshot({ path: `${out}/${id}-overview.jpg`, type: 'jpeg', quality: 85 });
      return layout;
    });

    await check(`${id}: closer view, second activation, and Escape`, async () => {
      if (viewport.width < 500) await button.tap();
      else await button.click();
      assert.equal(await button.getAttribute('aria-pressed'), 'true');
      await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('picture')).transform).a > 1.219);
      assertFits(await inspectLayout(page));
      await page.screenshot({ path: `${out}/${id}-closer.jpg`, type: 'jpeg', quality: 85 });
      if (viewport.width === 390 || viewport.width === 1440) await captureContrast(page, id + '-closer');
      await button.click();
      assert.equal(await button.getAttribute('aria-pressed'), 'false');
      await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('picture')).transform).a === 1);
      await button.click();
      await page.keyboard.press('Escape');
      assert.equal(await button.getAttribute('aria-pressed'), 'false');
      assert.equal((await page.locator('body').innerText()).trim(), 'elysium guild');
    });

    if (viewport.width === 390 || viewport.width === 1440) {
      await check(`${id}: keyboard, focus, reduced motion`, async () => {
        await page.reload({ waitUntil: 'networkidle' });
        await page.keyboard.press('Tab');
        assert(await button.evaluate((element) => element === document.activeElement));
        assert.equal(await button.evaluate((element) => getComputedStyle(element).outlineWidth), '3px');
        await page.screenshot({ path: `${out}/${id}-focus.png` });
        await button.evaluate((element) => { element.style.outline = 'none'; });
        await page.screenshot({ path: `${out}/${id}-focus-background.png` });
        await button.evaluate((element) => { element.style.outline = ''; });
        await page.keyboard.press('Enter');
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
        await page.keyboard.press('Escape');
        assert.equal(await button.getAttribute('aria-pressed'), 'false');
        assert(await button.evaluate((element) => element === document.activeElement));
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.keyboard.press('Space');
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('picture').evaluate((element) => getComputedStyle(element).transitionDuration), '0s');
        assert.equal(await page.locator('picture').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a), 1.22);
        assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
        await page.keyboard.press('Space');
        assert.equal(await button.getAttribute('aria-pressed'), 'false');
      });

      if (process.env.IMD_AXE) {
        await check(`${id}: axe accessibility scan`, async () => {
          await page.addScriptTag({ path: resolve(process.env.IMD_AXE) });
          const audit = await page.evaluate(async () => {
            const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
            return { violations: result.violations, incomplete: result.incomplete.map((item) => ({ id: item.id, nodes: item.nodes.length })), passes: result.passes.length };
          });
          await writeFile(`${out}/${id}-axe.json`, JSON.stringify(audit, null, 2));
          assert.equal(audit.violations.length, 0, JSON.stringify(audit.violations.map((violation) => violation.id)));
          return audit;
        });
      }

      await check(`${id}: artwork contrast capture`, async () => {
        await captureContrast(page, id);
      });
    }

    if (viewport.width === 320 || viewport.width === 390) {
      await check(`${id}: 200% text enlargement`, async () => {
        await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
        await page.screenshot({ path: `${out}/${id}-text-200.jpg`, type: 'jpeg', quality: 85 });
        const layout = await inspectLayout(page);
        assertFits(layout);
        await captureContrast(page, id + '-text-200');
        await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
        return layout;
      });
    }

    if (viewport.width === 390) {
      await check(`${id}: RTL mirror`, async () => {
        await page.evaluate(() => { document.documentElement.style.fontSize = ''; document.documentElement.dir = 'rtl'; });
        const layout = await inspectLayout(page);
        assertFits(layout);
        assert(layout.control.x < 50, 'Control did not mirror');
        return layout;
      });
      await check(`${id}: forced colors`, async () => {
        await page.emulateMedia({ forcedColors: 'active' });
        await button.focus();
        assert.equal(await button.evaluate((element) => getComputedStyle(element).outlineStyle), 'solid');
        await page.screenshot({ path: `${out}/${id}-forced-colors.png` });
      });
    }
    await context.close();
  }
  await check('Console, resources, and offline dependencies', () => assert.deepEqual(errors, []));
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}

await writeFile(`${out}/results.json`, JSON.stringify({ engine, results }, null, 2));
for (const result of results) console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.name}${result.error ? ': ' + result.error : ''}`);
const failures = results.filter((result) => !result.passed);
console.log(`${results.length - failures.length}/${results.length} checks passed (${engine}).`);
if (failures.length) process.exitCode = 1;
