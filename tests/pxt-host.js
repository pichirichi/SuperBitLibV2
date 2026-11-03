// Local compiler host: dependency installation is a separate, explicit step.
// Deliberately cannot download packages or submit source for cloud compilation.
const fs = require('node:fs');
const path = require('node:path');
require('pxt-core/built/pxt.js');
const targetDir = path.dirname(require.resolve('pxt-microbit/package.json'));
pxt.setAppTarget(JSON.parse(fs.readFileSync(path.join(targetDir, 'built/target.json'), 'utf8')));
const host = {
    readFile(pkg, filename) {
        const root = pkg.id === 'this' ? '.' : path.join('pxt_modules', pkg.id);
        const file = path.join(root, filename);
        return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    },
    writeFile() { throw new Error('Read-only validation host'); },
    downloadPackageAsync() { throw new Error('Run pxt install before validation'); },
    getHexInfoAsync() { throw new Error('Native builds require a separate toolchain'); },
    cacheStoreAsync() { return Promise.resolve(); },
    cacheGetAsync() { return Promise.resolve(null); }
};
async function load() {
    const pkg = new pxt.MainPackage(host);
    await pkg.loadAsync();
    const target = pkg.getTargetOptions();
    target.isNative = false;
    target.hasHex = false;
    const opts = await pkg.getCompileOptionsAsync(target);
    opts.ast = true;
    return { pkg, opts };
}
module.exports = { load };
