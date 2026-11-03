const assert = require('node:assert/strict');
const fs = require('node:fs');
const { load } = require('./pxt-host');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const tokens = text => [...text.matchAll(/[%$]([A-Za-z_]\w*)/g)].map(m => m[1]).sort();
async function main() {
    const { pkg, opts } = await load();
    const result = pxtc.compile(opts);
    assert.equal(result.success, true, JSON.stringify(result.diagnostics));
    const apis = pxtc.getApiInfo(result.ast, opts.jres);
    const originalApis = JSON.stringify(apis);
    let count = 0;
    for (const suffix of ['', '-jsdoc']) {
        const file = `SuperBitV2${suffix}-strings.json`;
        const english = read(`_locales/${file}`);
        const hebrew = read(`_locales/he/${file}`);
        for (const [key, original] of Object.entries(english)) {
            if (/^\{id:category\}/.test(key)) {
                const category = key.slice('{id:category}'.length);
                const namespace = category === 'Neopixel' ? 'neopixel' : category;
                assert.ok(hebrew[namespace + '|block'], `Missing category translation: ${key}`);
                count++;
                continue;
            }
            assert.ok(hebrew[key], `Missing Hebrew: ${key}`);
            assert.deepEqual(tokens(hebrew[key]), tokens(original), `Placeholder mismatch: ${key}`);
            if (key.endsWith('|block')) {
                assert.equal(hebrew[key].split('|').length, original.split('|').length,
                    `Block segment mismatch: ${key}`);
            }
            count++;
        }
    }
    const english = read('_locales/SuperBitV2-strings.json');
    const hebrew = read('_locales/he/SuperBitV2-strings.json');
    pxt.Util.setUserLanguage('he');
    await pxtc.localizeApisAsync(apis, pkg);
    for (const [key, expected] of Object.entries(hebrew)) {
        if (!key.endsWith('|block')) continue;
        const api = apis.byQName[key.slice(0, -6)];
        if (api && english[key]) assert.equal(api.attributes.block, expected, `Not loaded: ${key}`);
    }
    const tooltip = apis.byQName['SuperBitV2.Servo'].attributes.jsDoc;
    assert.match(tooltip, /מיפוי/);
    // Fresh API metadata demonstrates English and an unavailable locale fall back.
    for (const lang of ['en', 'xx']) {
        const fallback = JSON.parse(originalApis);
        pxt.Util.setUserLanguage(lang);
        await pxtc.localizeApisAsync(fallback, pkg);
        assert.equal(fallback.byQName['SuperBitV2.Servo'].attributes.block,
            english['SuperBitV2.Servo|block']);
    }
    console.log(`PASS: local PXT compile; ${count} localization keys; Hebrew loading; English fallback`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
