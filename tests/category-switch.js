const assert = require('node:assert/strict');
const { load } = require('./pxt-host');
const categories = {
    SuperBitV2: 'SuperBitV2',
    SuperBitV2_Digital: 'SuperBitV2_Digital',
    SuperBitV2_Analog: 'SuperBitV2_Analog',
    SuperBitV2_PWM: 'SuperBitV2_PWM',
    neopixel: 'NeoPixel'
};
// MakeCode's web editor caches symbols by restoring _untranslatedBlock
// before the metadata is reused after an editor reload/language change.
function cacheForReload(apis) {
    const copy = JSON.parse(JSON.stringify(apis));
    for (const symbol of Object.values(copy.byQName)) {
        const attributes = symbol.attributes;
        delete attributes._translatedLanguageCode;
        if (attributes._untranslatedBlock) {
            attributes.block = attributes._untranslatedBlock;
            delete attributes._untranslatedBlock;
            pxtc.updateBlockDef(attributes);
        }
    }
    return copy;
}
async function main() {
    const { pkg, opts } = await load();
    const result = pxtc.compile(opts);
    assert.equal(result.success, true, JSON.stringify(result.diagnostics));
    let apis = pxtc.getApiInfo(result.ast, opts.jres);
    for (const [name, expected] of Object.entries(categories)) {
        assert.equal(apis.byQName[name].attributes.block, expected, `English baseline: ${name}`);
    }
    for (let cycle = 0; cycle < 2; cycle++) {
        pxt.Util.setUserLanguage('he');
        await pxtc.localizeApisAsync(apis, pkg);
        for (const [name, english] of Object.entries(categories)) {
            const attrs = apis.byQName[name].attributes;
            assert.equal(attrs._untranslatedBlock, english, `Missing English cache value: ${name}`);
            if (name !== 'SuperBitV2') assert.match(attrs.block, /[\u0590-\u05ff]/, `Missing Hebrew: ${name}`);
        }
        apis = cacheForReload(apis);
        pxt.Util.setUserLanguage('en');
        await pxtc.localizeApisAsync(apis, pkg);
        for (const [name, english] of Object.entries(categories)) {
            assert.equal(apis.byQName[name].attributes.block, english, `English after Hebrew: ${name}`);
        }
        apis = cacheForReload(apis);
    }
    console.log('PASS: two Hebrew → English category switches with MakeCode cached metadata');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
