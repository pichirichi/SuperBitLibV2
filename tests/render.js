const fs = require('fs');
const path = require('path');
const dir = path.dirname(path.dirname(require.resolve('pxt-core/package.json')));
const puppeteer = require('puppeteer');
const { load } = require('./pxt-host');
(async () => {
 const { pkg, opts } = await load();
 const result = pxtc.compile(opts);
 const apis = pxtc.getApiInfo(result.ast, opts.jres);
 pxt.Util.setUserLanguage('he');
 await pxtc.localizeApisAsync(apis, pkg);
 const info = pxtc.getBlocksInfo(apis);
 const target = JSON.parse(fs.readFileSync(dir+'/pxt-microbit/built/target.json'));
 const browser = await puppeteer.launch({headless:true});
 try {
 const page = await browser.newPage();
 await page.setViewport({width:1500,height:1200});
 page.on('pageerror',err=>console.error('PAGE:',err.message));
 await page.setRequestInterception(true);
 page.on('request',r=>r.abort()); // No source or telemetry leaves the local browser.
 await page.setContent('<!doctype html><html lang="he"><head><meta charset="utf-8"></head><body><div id="blocks" style="width:1450px;height:1150px"></div></body></html>');
 for (const file of ['built/web/jquery.js','built/web/typescript.js','built/pxtlib.js','built/pxtcompiler.js','built/tests/blockssetup.js']) {
  await page.addScriptTag({content:fs.readFileSync(dir+'/pxt-core/'+file,'utf8')});
 }
 await page.addStyleTag({content:fs.readFileSync(dir+'/pxt-core/built/web/rtlblockly.css','utf8')});
 const data = await page.evaluate(({info,target})=> {
  pxt.setAppTarget(target);
  pxt.webConfig={commitCdnUrl:"",relprefix:""};
  pxt.Util.setUserLanguage('he');
  const Blockly=pxt.blocks.requireBlockly();
  const blocks=pxt.blocks.requirePxtBlockly();
  blocks.initializeAndInject(info);
  const ws=Blockly.inject(document.getElementById('blocks'),{rtl:true,readOnly:false,renderer:'pxt',sounds:false,media:''});
  const ids=info.blocks.filter(x=>x.namespace.startsWith('SuperBitV2') || x.namespace.startsWith('neopixel')).map(x=>x.attributes.blockId);
  let y=30; const rendered=[];
  for(const id of ids) {
    const block=ws.newBlock(id); block.initSvg();block.render();block.moveBy(-30,y);
    rendered.push({id,text:block.toString(),tooltip:typeof block.tooltip==='string'?block.tooltip:'dynamic',height:block.getHeightWidth().height});
    y+=block.getHeightWidth().height+24;
  }
  window.ws=ws; return {rendered,height:y,rtl:ws.RTL,language:pxt.Util.userLanguage()};
 },{info,target});
 require('node:assert/strict').equal(data.language,'he');
 require('node:assert/strict').equal(data.rtl,true);
 require('node:assert/strict').ok(data.rendered.length>=49);
 fs.mkdirSync('built/validation',{recursive:true});
 fs.writeFileSync('built/validation/hebrew-blocks.json',JSON.stringify(data,null,2));
 await page.setViewport({width:1500,height:Math.min(data.height+50,6000)});
 await page.evaluate(height=>document.getElementById('blocks').style.height=height+'px',data.height+20);
 await page.evaluate(() => { const Blockly=pxt.blocks.requireBlockly(); Blockly.svgResize(window.ws); window.ws.zoomToFit(); });
 await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
 await page.evaluate(() => { const Blockly=pxt.blocks.requireBlockly(); const blocks=pxt.blocks.requirePxtBlockly(); const xml=Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws)); const svg=blocks.render(xml,{}); document.getElementById('blocks').replaceChildren(svg);const bounds=svg.getBBox();svg.setAttribute('viewBox',[bounds.x-10,bounds.y-10,bounds.width+20,bounds.height+20].join(' '));const box=svg.viewBox.baseVal; svg.style.width='1400px';svg.style.height=Math.ceil(1400*box.height/box.width)+'px';svg.setAttribute('width','1400');svg.setAttribute('height',Math.ceil(1400*box.height/box.width));document.getElementById('blocks').replaceChildren(svg); });
 await (await page.$('#blocks>svg')).screenshot({path:'built/validation/hebrew-blocks.png'});
 console.log(JSON.stringify({blocks:data.rendered.length,rtl:data.rtl,language:data.language,screenshot:'built/validation/hebrew-blocks.png'}));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
