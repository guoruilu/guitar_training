import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.GUITAR_TRAINING_URL ?? 'http://127.0.0.1:5181/';
const outputDir = path.resolve('log/playwright-2026-06-18');

async function canvasStats(page) {
  return page.locator('.fretboard-3d-canvas canvas').evaluate((canvas) => {
    const element = canvas;
    const gl = element.getContext('webgl2') ?? element.getContext('webgl');
    if (!gl) {
      return { error: 'No WebGL context' };
    }

    const sampleWidth = Math.min(element.width, 320);
    const sampleHeight = Math.min(element.height, 240);
    const x = Math.floor((element.width - sampleWidth) / 2);
    const y = Math.floor((element.height - sampleHeight) / 2);
    const pixels = new Uint8Array(sampleWidth * sampleHeight * 4);
    gl.readPixels(x, y, sampleWidth, sampleHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    let nonBlank = 0;
    let colored = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const alpha = pixels[index + 3];
      if (alpha > 0 && red + green + blue > 36) {
        nonBlank += 1;
      }
      if (Math.max(red, green, blue) - Math.min(red, green, blue) > 12) {
        colored += 1;
      }
    }

    const samplePixels = sampleWidth * sampleHeight;
    return {
      width: element.width,
      height: element.height,
      samplePixels,
      nonBlank,
      colored,
      nonBlankRatio: nonBlank / samplePixels,
      coloredRatio: colored / samplePixels,
    };
  });
}

async function verifyViewport(browser, name, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 700 });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '琶音训练' }).click();
  await page.getByLabel('视角').selectOption('player');
  await page.locator('.fretboard-3d-canvas canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(900);

  const defaultStats = await canvasStats(page);
  if ('error' in defaultStats || defaultStats.nonBlankRatio < 0.12 || defaultStats.coloredRatio < 0.05) {
    throw new Error(`${name} default canvas check failed: ${JSON.stringify(defaultStats)}`);
  }

  const screenshotPath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const box = await page.locator('.fretboard-3d-canvas canvas').boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.54, box.y + box.height * 0.48);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.59, box.y + box.height * 0.44, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(350);
  }

  const draggedStats = await canvasStats(page);
  if ('error' in draggedStats || draggedStats.nonBlankRatio < 0.12 || draggedStats.coloredRatio < 0.05) {
    throw new Error(`${name} dragged canvas check failed: ${JSON.stringify(draggedStats)}`);
  }

  const draggedScreenshotPath = path.join(outputDir, `${name}-dragged.png`);
  await page.screenshot({ path: draggedScreenshotPath, fullPage: true });
  await page.close();

  return { name, viewport, screenshotPath, draggedScreenshotPath, defaultStats, draggedStats };
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const results = [];
  results.push(await verifyViewport(browser, 'desktop-3d-fretboard', { width: 1365, height: 900 }));
  results.push(await verifyViewport(browser, 'mobile-3d-fretboard', { width: 390, height: 844 }));
  await writeFile(path.join(outputDir, 'summary.json'), JSON.stringify({ baseUrl, results }, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
