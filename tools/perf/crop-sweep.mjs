/**
 * object-position sweep: which crop puts the fewest bright pixels behind
 * the text block.
 *
 * Renders the hero geometry with NO scrim and reports the brightest raw
 * photographic pixel inside the text block's box, per viewport, per
 * candidate object-position. The scrim alpha needed is a function of that
 * number, so this is the thing to minimise first.
 */
import { launch } from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const IMAGE = "http://localhost:3100/hero/church.webp";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const POSITIONS = [
  "0% 50%", "10% 50%", "20% 50%", "30% 50%", "40% 50%",
  "50% 50%", "60% 50%", "70% 50%", "80% 50%", "90% 50%", "100% 50%",
  "50% 0%", "50% 25%", "50% 75%", "50% 100%",
  "30% 30%", "70% 30%", "30% 70%", "70% 70%",
];

const lin = (v) => { const x = v / 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };

function html(objectPosition) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  .hero { position:relative; isolation:isolate; height:100svh; overflow:hidden;
          background:#052252; display:flex; flex-direction:column; justify-content:flex-end; }
  .hero img { position:absolute; inset:0; width:100%; height:100%;
              object-fit:cover; object-position:${objectPosition}; z-index:-20; }
  .wrap { width:100%; max-width:64rem; margin:0 auto; padding:0 1.5rem 4rem; }
  #textblock { display:flex; flex-direction:column; gap:1rem; max-width:42rem; color:#fff; }
  .title { font:400 clamp(2.75rem,1.5rem + 5vw,5.5rem)/1.02 Georgia,serif; }
  .meta { font:400 1.125rem/1.75rem system-ui; }
  .cta { align-self:flex-start; background:#fff; color:#052252; padding:.625rem 1.25rem;
         border-radius:5px; font:500 .875rem/1.25rem system-ui; }
  #headerblock { position:absolute; top:0; left:0; right:0; height:5rem; display:flex;
                 align-items:center; max-width:64rem; margin:0 auto; padding:0 1.5rem; color:#fff; }
</style></head><body>
  <section class="hero">
    <img src="${IMAGE}" alt="">
    <div id="headerblock"><span>Camp Meeting 2026</span></div>
    <div class="wrap"><div id="textblock">
      <h1 class="title">Camp Meeting 2026</h1>
      <p class="meta">15 to 22 August 2026 at 5th Ngong Avenue, Nairobi</p>
      <span class="cta">See the programme</span>
    </div></div>
  </section>
</body></html>`;
}

const browser = await launch({
  executablePath: CHROME, headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
});

const table = new Map();

for (const v of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ ...v, deviceScaleFactor: 1 });

  for (const pos of POSITIONS) {
    await page.setContent(html(pos), { waitUntil: "load", timeout: 120000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const img = document.querySelector("img");
      if (!img.complete) await new Promise((r) => (img.onload = r));
      await img.decode();
    });

    const boxes = await page.evaluate(() => {
      const b = (s) => { const r = document.querySelector(s).getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height }; };
      return { text: b("#textblock"), header: b("#headerblock") };
    });
    await page.evaluate(() => {
      document.querySelector("#textblock").style.visibility = "hidden";
      document.querySelector("#headerblock").style.visibility = "hidden";
    });
    const shot = await page.screenshot({ type: "png", encoding: "base64" });
    const px = await page.evaluate(async (b64, regions) => {
      const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const c = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = c.getContext("2d"); ctx.drawImage(bmp, 0, 0);
      const out = {};
      for (const [k, r] of Object.entries(regions)) {
        const x = Math.max(0, Math.floor(r.x)), y = Math.max(0, Math.floor(r.y));
        const w = Math.min(c.width - x, Math.ceil(r.width)), h = Math.min(c.height - y, Math.ceil(r.height));
        out[k] = Array.from(ctx.getImageData(x, y, w, h).data);
      }
      return out;
    }, shot, boxes);

    const worst = (arr) => { let m = -1; for (let i = 0; i < arr.length; i += 4) {
      const L = 0.2126 * lin(arr[i]) + 0.7152 * lin(arr[i + 1]) + 0.0722 * lin(arr[i + 2]);
      if (L > m) m = L; } return m; };

    if (!table.has(pos)) table.set(pos, {});
    table.get(pos)[v.width] = { text: worst(px.text), header: worst(px.header) };
  }
  await page.close();
}
await browser.close();

const pad = (s, n) => String(s).padEnd(n);
console.log("\nBRIGHTEST RAW PHOTOGRAPHIC PIXEL in the text block box (no scrim). Lower is better.\n");
console.log(pad("object-position", 18) + VIEWPORTS.map((v) => pad(v.width, 9)).join("") + "  worst");
console.log("-".repeat(80));
for (const [pos, row] of table) {
  const vals = VIEWPORTS.map((v) => row[v.width].text);
  console.log(pad(pos, 18) + vals.map((x) => pad(x.toFixed(3), 9)).join("") + "  " + Math.max(...vals).toFixed(3));
}
console.log("\nsame, for the HEADER box\n");
console.log(pad("object-position", 18) + VIEWPORTS.map((v) => pad(v.width, 9)).join("") + "  worst");
console.log("-".repeat(80));
for (const [pos, row] of table) {
  const vals = VIEWPORTS.map((v) => row[v.width].header);
  console.log(pad(pos, 18) + vals.map((x) => pad(x.toFixed(3), 9)).join("") + "  " + Math.max(...vals).toFixed(3));
}
