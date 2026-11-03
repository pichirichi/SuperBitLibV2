const assert = require('node:assert/strict');
const fs = require('node:fs');
const { load } = require('./pxt-host');
async function main() {
    const { opts } = await load();
    const library = 'pxt_modules/SuperBitV2/main.ts';
    opts.fileSystem[library] = opts.fileSystem['main.ts'];
    opts.sourceFiles = opts.sourceFiles.filter(f => f !== 'test.ts').map(f => f === 'main.ts' ? library : f);
    opts.sourceFiles.push('main.ts');
    const example = fs.existsSync('examples/servos.ts') ? fs.readFileSync('examples/servos.ts', 'utf8') : [
        'SuperBitV2.Servo(SuperBitV2.enServo.S8, 90)',
        'SuperBitV2.Servo2(SuperBitV2.enServo.S1, 135)',
        'SuperBitV2.Servo3(SuperBitV2.enServo.S2, SuperBitV2.enPos.stop, 0)',
        'SuperBitV2.Servo4(SuperBitV2.enServo.S3, SuperBitV2.enPos.forward, 45)',
        'SuperBitV2.Music(SuperBitV2.enMusic.birthday)',
        'SuperBitV2.MotorRun(SuperBitV2.enMotors.M1, 100)'
    ].join('\n');
    opts.fileSystem['main.ts'] = example;
    const result = pxtc.compile(opts);
    assert.equal(result.success, true, JSON.stringify(result.diagnostics));
    const blocks = pxtc.decompile(result.ast, opts, 'main.ts');
    assert.equal(blocks.success, true, JSON.stringify(blocks.diagnostics));
    const xml = blocks.outfiles['main.blocks'];
    assert.ok(xml && !xml.includes('typescript_statement'), 'Must generate native blocks, not grey code blocks');
    const python = pxt.py.decompileToPython(result.ast, 'main.ts');
    assert.equal(python.success, true, JSON.stringify(python.diagnostics));
    const pyOpts = { ...opts, target: { ...opts.target, preferredEditor: pxt.PYTHON_PROJECT_NAME },
        fileSystem: { ...opts.fileSystem, 'main.ts': '', 'main.py': python.outfiles['main.py'] },
        sourceFiles: [...opts.sourceFiles, 'main.py'] };
    pxt.prepPythonOptions(pyOpts);
    const converted = pxt.py.py2ts(pyOpts);
    assert.equal(converted.success, true, JSON.stringify(converted.diagnostics));
    Object.assign(pyOpts.fileSystem, converted.outfiles);
    pyOpts.target.preferredEditor = pxt.JAVASCRIPT_PROJECT_NAME;
    const roundtrip = pxtc.compile(pyOpts);
    assert.equal(roundtrip.success, true, JSON.stringify(roundtrip.diagnostics));
    fs.mkdirSync('built/validation', { recursive: true });
    fs.writeFileSync('built/validation/example.blocks', xml);
    fs.writeFileSync('built/validation/example.py', python.outfiles['main.py']);
    console.log('PASS: example PXT compile; native Blocks decompile; Python decompile, conversion and PXT recompile');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
