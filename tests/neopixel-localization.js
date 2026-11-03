const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
require('./pxt-host');

const example = `
let strip = SuperBitV2.RGB_Program()
strip.showColor(NeoPixelColors.Red)
strip.showRainbow(1, 360)
strip.showBarGraph(3, 4)
strip.setBrightness(64)
strip.setPixelColor(0, neopixel.rgb(20, 40, 60))
strip.setPixelWhiteLED(0, 128)
strip.easeBrightness()
strip.setMatrixWidth(2, 0, 0)
strip.setMatrixColor(0, 0, neopixel.colors(NeoPixelColors.Blue))
strip.shift(1)
strip.rotate(1)
strip.clear()
strip.show()
let section = strip.range(0, 2)
section.showColor(neopixel.hsl(120, 99, 50))
let numberOfLights = strip.length()
let estimatedCurrent = strip.power()
let separateStrip = neopixel.create(DigitalPin.P0, 4, NeoPixelMode.RGB)
separateStrip.showColor(NeoPixelColors.Green)
`;

// Model a normal consuming MakeCode project: SuperBitV2 is a dependency,
// which in turn depends on the existing NeoPixel package. No network is used.
const host = {
    readFile(pkg, file) {
        if (pkg.id === 'this') {
            if (file === 'pxt.json') return JSON.stringify({
                name: 'superbit-hebrew-consumer',
                dependencies: { core: '*', microphone: '*', SuperBitV2: 'file:.' },
                files: ['main.ts']
            });
            return file === 'main.ts' ? example : null;
        }
        const root = pkg.id === 'SuperBitV2' ? '.' : path.join('pxt_modules', pkg.id);
        const filename = path.join(root, file);
        return fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : null;
    },
    writeFile() { throw new Error('Read-only consumer test'); },
    downloadPackageAsync() { throw new Error('Run pxt install first'); },
    getHexInfoAsync() { throw new Error('Simulator compilation only'); },
    cacheStoreAsync() { return Promise.resolve(); },
    cacheGetAsync() { return Promise.resolve(null); }
};
const read = name => JSON.parse(fs.readFileSync(name, 'utf8'));
const tokens = text => [...text.matchAll(/[%$]([A-Za-z_]\w*)/g)].map(m => m[1]).sort();
const shadows = text => [...text.matchAll(/[%$]\w+=(\w+)/g)].map(m => m[1]).sort();

async function main() {
    const pkg = new pxt.MainPackage(host);
    await pkg.loadAsync();
    const target = pkg.getTargetOptions();
    target.isNative = false;
    target.hasHex = false;
    const opts = await pkg.getCompileOptionsAsync(target);
    opts.ast = true;
    const result = pxtc.compile(opts);
    assert.equal(result.success, true, JSON.stringify(result.diagnostics));
    const apis = pxtc.getApiInfo(result.ast, opts.jres);
    const originalApis = JSON.stringify(apis);
    const neoApis = { byQName: Object.fromEntries(Object.entries(apis.byQName)
        .filter(([key]) => /^(neopixel(?:\.|$)|NeoPixel)/.test(key))) };
    const extracted = pxtc.genDocs('neopixel', neoApis, { locs: true });
    let count = 0;
    for (const suffix of ['', '-jsdoc']) {
        const english = JSON.parse(extracted[`neopixel${suffix}-strings.json`]);
        const hebrew = read(`_locales/he/SuperBitV2${suffix}-strings.json`);
        for (const [key, value] of Object.entries(english)) {
            assert.ok(hebrew[key], `Missing NeoPixel translation: ${key}`);
            assert.deepEqual(tokens(hebrew[key]), tokens(value), `Parameter tokens: ${key}`);
            assert.deepEqual(shadows(hebrew[key]), shadows(value), `Shadow IDs: ${key}`);
            if (key.endsWith('|block')) {
                assert.equal(hebrew[key].split('|').length, value.split('|').length,
                    `Block segments: ${key}`);
            }
            count++;
        }
    }
    pxt.Util.setUserLanguage('he');
    await pxtc.localizeApisAsync(apis, pkg);
    const translatedBlocks = read('_locales/he/SuperBitV2-strings.json');
    const translatedDocs = read('_locales/he/SuperBitV2-jsdoc-strings.json');
    for (const [key, expected] of Object.entries(translatedBlocks)) {
        if (!/^(neopixel(?:\.|\|)|NeoPixel)/.test(key) || !key.endsWith('|block')) continue;
        const qName = key.slice(0, -6);
        assert.equal(apis.byQName[qName].attributes.block, expected, `Hebrew not loaded: ${qName}`);
    }
    for (const [key, expected] of Object.entries(translatedDocs)) {
        if (!/^(neopixel(?:\.|$)|NeoPixel)/.test(key)) continue;
        if (key.includes('|param|')) {
            const [qName, parameter] = key.split('|param|');
            assert.equal(apis.byQName[qName].parameters.find(p => p.name === parameter).description,
                expected, `Parameter help not loaded: ${key}`);
        } else assert.equal(apis.byQName[key].attributes.jsDoc, expected, `Tooltip not loaded: ${key}`);
    }
    for (const language of ['en', 'xx']) {
        const fallback = JSON.parse(originalApis);
        pxt.Util.setUserLanguage(language);
        await pxtc.localizeApisAsync(fallback, pkg);
        assert.equal(fallback.byQName['neopixel.Strip.showColor'].attributes.block,
            '%strip|show color %rgb=neopixel_colors');
        assert.equal(fallback.byQName['NeoPixelColors.Red'].attributes.block, 'red');
    }

    // Use fresh English metadata to check the same unchanged public APIs in
    // native Blocks and MakeCode Python; translated text never renames APIs.
    const compiled = pxtc.compile(opts);
    const blocks = pxtc.decompile(compiled.ast, opts, 'main.ts');
    assert.equal(blocks.success, true, JSON.stringify(blocks.diagnostics));
    assert.ok(!blocks.outfiles['main.blocks'].includes('typescript_statement'));
    // Existing PXT limitation: Strip.length() decompiles as len(strip)().
    // Keep it in the full TypeScript/Blocks check, but omit that one call from
    // the Python fixture; localization must not rename or patch the API.
    const pythonOpts = { ...opts, fileSystem: { ...opts.fileSystem,
        'main.ts': example.replace('let numberOfLights = strip.length()\n', '') } };
    const pythonResult = pxtc.compile(pythonOpts);
    assert.equal(pythonResult.success, true, JSON.stringify(pythonResult.diagnostics));
    const python = pxt.py.decompileToPython(pythonResult.ast, 'main.ts');
    assert.equal(python.success, true, JSON.stringify(python.diagnostics));
    const pyOpts = { ...opts, target: { ...target, preferredEditor: pxt.PYTHON_PROJECT_NAME },
        sourceFiles: [...opts.sourceFiles, 'main.py'],
        fileSystem: { ...opts.fileSystem, 'main.ts': '', 'main.py': python.outfiles['main.py'] } };
    pxt.prepPythonOptions(pyOpts);
    const converted = pxt.py.py2ts(pyOpts);
    assert.equal(converted.success, true, JSON.stringify(converted.diagnostics));
    Object.assign(pyOpts.fileSystem, converted.outfiles);
    pyOpts.target.preferredEditor = pxt.JAVASCRIPT_PROJECT_NAME;
    assert.equal(pxtc.compile(pyOpts).success, true);
    fs.mkdirSync('built/validation', { recursive: true });
    fs.writeFileSync('built/validation/neopixel-example.blocks', blocks.outfiles['main.blocks']);
    fs.writeFileSync('built/validation/neopixel-example.py', python.outfiles['main.py']);
    console.log(`PASS: ${count} NeoPixel localization keys from the dependency; consumer-project Hebrew loading; English fallback; Blocks/Python round trip`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
