const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');

const assets = path.resolve(__dirname, '..');
const icons = path.join(assets, 'icons');

function makeIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = 6 + 16 * entries.length;
  const directory = entries.map(({size, png}) => {
    const entry = Buffer.alloc(16);
    entry[0] = size;
    entry[1] = size;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...directory, ...entries.map(({png}) => png)]);
}

(async () => {
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 640}, deviceScaleFactor: 1, reducedMotion: 'reduce'});
    await page.goto(pathToFileURL(path.join(__dirname, 'social-preview.html')).href);
    await page.locator('.photo').evaluate(async el => { await el.style.backgroundImage; });
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
    const boxes = await page.locator('.chip').evaluateAll(els => els.map(el => {
      const r = el.getBoundingClientRect();
      return {left: r.left, right: r.right, width: r.width, scrollWidth: el.scrollWidth};
    }));
    if (boxes.some((b, i) => b.right > 1216 || b.scrollWidth > b.width + 1 || (i && b.left < boxes[i-1].right))) {
      throw new Error('Chip clipping or overlap: ' + JSON.stringify(boxes));
    }
    await page.screenshot({path: path.join(assets, 'social-preview.png')});

    const svg = fs.readFileSync(path.join(assets, 'icon.svg'), 'utf8');
    const outputs = [
      ['favicon-16.png', 16, 1], ['favicon-32.png', 32, 1], ['favicon-48.png', 48, 1],
      ['apple-touch-icon.png', 180, 1], ['icon-192.png', 192, 1],
      ['icon-512.png', 512, 1], ['icon-512-maskable.png', 512, .8],
      ['icon-1024.png', 1024, 1],
    ];
    const icoEntries = [];
    for (const [name, size, scale] of outputs) {
      await page.setViewportSize({width: size, height: size});
      await page.setContent(`<html><head><style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#0A0F12}body{display:grid;place-items:center}svg{display:block;width:${scale*100}%;height:${scale*100}%}svg .beam,svg .tail{display:none!important}</style></head><body>${svg}</body></html>`);
      const png = await page.screenshot({path: path.join(icons, name)});
      if (size <= 48) icoEntries.push({size, png});
    }
    fs.writeFileSync(path.join(icons, 'favicon.ico'), makeIco(icoEntries));
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exitCode = 1; });
