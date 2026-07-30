// Contrast + upscale + screenshots against the REAL built page, not a mock.
import { launch } from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3100";
const VIEWPORTS = [ {w:390,h:844},{w:768,h:1024},{w:1024,h:768},{w:1440,h:900},{w:1920,h:1080},{w:2560,h:1440} ];
const lin=(v)=>{const x=v/255;return x<=0.04045?x/12.92:Math.pow((x+0.055)/1.055,2.4)};
const lum=(r,g,b)=>0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
const cw=(L)=>1.05/(L+0.05);
const browser = await launch({executablePath:CHROME, headless:true, args:["--no-sandbox","--disable-gpu","--force-device-scale-factor=1"]});
const rows=[];
for (const v of VIEWPORTS){
  const page = await browser.newPage();
  await page.setViewport({width:v.w,height:v.h,deviceScaleFactor:1});
  await page.setRequestInterception(true);
  page.on("request",(r)=>{ if(/\/serwist\/|sw\.js/.test(r.url())) r.abort().catch(()=>{}); else r.continue().catch(()=>{}); });
  await page.goto(`${BASE}/`,{waitUntil:"load",timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await new Promise(r=>setTimeout(r,600));

  const geo = await page.evaluate(()=>{
    const hero=document.getElementById("home-hero");
    const h1=hero.querySelector("h1");
    const meta=h1.nextElementSibling;
    const cta=meta.nextElementSibling;
    const header=document.querySelector("header");
    const img=hero.querySelector("img");
    const box=(el)=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};
    // union of the three text rows = the text region
    const rs=[h1,meta,cta].map(e=>e.getBoundingClientRect());
    const x=Math.min(...rs.map(r=>r.x)), y=Math.min(...rs.map(r=>r.y));
    const x2=Math.max(...rs.map(r=>r.right)), y2=Math.max(...rs.map(r=>r.bottom));
    return { text:{x,y,width:x2-x,height:y2-y}, header:box(header),
             heroH:Math.round(hero.getBoundingClientRect().height),
             phase:hero.getAttribute("data-hero-phase"),
             headerState:document.querySelector("header").getAttribute("data-header-state"),
             natW:img.naturalWidth, natH:img.naturalHeight,
             renderW:Math.round(img.getBoundingClientRect().width), renderH:Math.round(img.getBoundingClientRect().height) };
  });

  const scan = async (label)=>{
    const shot = await page.screenshot({type:"png",encoding:"base64"});
    return await page.evaluate(async (b64, regions)=>{
      const bmp=await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const c=new OffscreenCanvas(bmp.width,bmp.height); const ctx=c.getContext("2d"); ctx.drawImage(bmp,0,0);
      const out={};
      for(const [k,reg] of Object.entries(regions)){
        const x=Math.max(0,Math.floor(reg.x)), y=Math.max(0,Math.floor(reg.y));
        const w=Math.min(c.width-x,Math.ceil(reg.width)), h=Math.min(c.height-y,Math.ceil(reg.height));
        if(w<=0||h<=0){ out[k]=null; continue; }
        out[k]=Array.from(ctx.getImageData(x,y,w,h).data);
      }
      return out;
    }, shot, {text:geo.text, header:geo.header});
  };

  // hide type, keep layout, so we measure the backdrop
  await page.evaluate(()=>{
    const hero=document.getElementById("home-hero");
    hero.querySelectorAll("h1,p,a").forEach(e=>e.style.visibility="hidden");
    document.querySelector("header").querySelectorAll("a,button,span").forEach(e=>e.style.visibility="hidden");
  });
  const px = await scan("transparent");
  const worst=(arr)=>{ if(!arr) return null; let m=-1,rgb=null; for(let i=0;i<arr.length;i+=4){const L=lum(arr[i],arr[i+1],arr[i+2]); if(L>m){m=L;rgb=[arr[i],arr[i+1],arr[i+2]]}} return {L:m,rgb}; };
  const t=worst(px.text), hd=worst(px.header);

  // glass state: scroll past the sentinel, re-measure the header only
  await page.evaluate(()=>window.scrollTo(0,400));
  await new Promise(r=>setTimeout(r,400));
  const glassState = await page.evaluate(()=>document.querySelector("header").getAttribute("data-header-state"));
  const pxG = await scan("glass");
  const hg = worst(pxG.header);

  rows.push({v,geo,t,hd,hg,glassState});
  if(v.w===1920||v.w===2560){ await page.evaluate(()=>window.scrollTo(0,0)); await new Promise(r=>setTimeout(r,300));
    await page.evaluate(()=>{const hero=document.getElementById("home-hero"); hero.querySelectorAll("h1,p,a").forEach(e=>e.style.visibility=""); document.querySelector("header").querySelectorAll("a,button,span").forEach(e=>e.style.visibility="");});
    await page.screenshot({path:`${process.argv[2]}/hero-${v.w}.png`, clip:{x:0,y:0,width:v.w,height:Math.min(v.h,900)}}); }
  await page.close();
}
await browser.close();
const pad=(s,n)=>String(s).padEnd(n);
console.log("\n=== hero, real page, phase="+rows[0].geo.phase+" ===");
console.log(pad("viewport",12)+pad("heroH",8)+pad("text worst",18)+pad("text AA",13)+pad("hdr transp",13)+pad("hdr glass",13)+"glassState");
console.log("-".repeat(92));
for(const r of rows){
  console.log(pad(`${r.v.w}x${r.v.h}`,12)+pad(r.geo.heroH,8)+pad(`rgb(${r.t.rgb})`,18)
   +pad(`${cw(r.t.L).toFixed(2)}:1 ${cw(r.t.L)>=4.5?"PASS":"FAIL"}`,13)
   +pad(`${cw(r.hd.L).toFixed(2)}:1 ${cw(r.hd.L)>=4.5?"PASS":"FAIL"}`,13)
   +pad(`${cw(r.hg.L).toFixed(2)}:1 ${cw(r.hg.L)>=4.5?"PASS":"FAIL"}`,13)+r.glassState);
}
console.log("\n=== upscale (source "+rows[0].geo.natW+"x"+rows[0].geo.natH+") ===");
for(const r of rows){
  const s=Math.max(r.geo.renderW/r.geo.natW, r.geo.renderH/r.geo.natH);
  console.log(pad(`${r.v.w}x${r.v.h}`,12)+`css box ${r.geo.renderW}x${r.geo.renderH}  object-cover upscale ${s.toFixed(3)}x  (at DPR2 ${(s*2).toFixed(2)}x)`);
}
const wt=Math.min(...rows.map(r=>cw(r.t.L))), wh=Math.min(...rows.map(r=>cw(r.hd.L))), wg=Math.min(...rows.map(r=>cw(r.hg.L)));
console.log(`\nworst: text ${wt.toFixed(2)}:1  header transparent ${wh.toFixed(2)}:1  header glass ${wg.toFixed(2)}:1`);
