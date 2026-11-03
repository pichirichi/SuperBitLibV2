const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
require('pxt-core');
function board(source) {
    const writes = [];
    const context = { Math: Object.assign(Object.create(Math), {
        map: (n, a, b, c, d) => (n - a) * (d - c) / (b - a) + c
    }), NumberFormat: { UInt8BE: 0 },
    pins: {
        createBuffer: size => new Uint8Array(size),
        i2cWriteBuffer: (address, buffer) => writes.push({ address, bytes: [...buffer] }),
        i2cWriteNumber() {}, i2cReadNumber() { return 0; }
    }, control: { waitMicros() {} } };
    vm.createContext(context);
    vm.runInContext(ts.transpile(source, { target: ts.ScriptTarget.ES5 }), context);
    return { api: context.SuperBitV2, writes,
        pulse(call, port, ticks) {
            writes.length = 0;
            call();
            const pwm = writes.filter(w => w.bytes.length === 5);
            assert.equal(pwm.length, 1);
            assert.deepEqual(pwm[0], { address: 0x40,
                bytes: [6 + port * 4, 0, 0, ticks & 255, ticks >> 8] });
        },
        silent(call) { writes.length = 0; call(); assert.equal(writes.length, 0); }
    };
}
const source = fs.readFileSync('main.ts', 'utf8');
const b = board(source), s = b.api;
for (let port = 0; port < 8; port++) {
    for (const [angle, ticks] of [[0,205],[90,307],[180,410],[-100,205],[999,410],
        [NaN,307],[-Infinity,205],[Infinity,410],[45.5,257]]) {
        b.pulse(() => s.Servo180(port, angle), port, ticks);
    }
    for (const direction of [s.ServoDirection.Forward, s.ServoDirection.Reverse]) {
        const full = direction === s.ServoDirection.Forward ? 164 : 533;
        const half = direction === s.ServoDirection.Forward ? 256 : 441;
        for (const [speed,ticks] of [[0,348],[50,half],[100,full],[-10,348],
            [120,full],[NaN,348],[-Infinity,348],[Infinity,full]]) {
            b.pulse(() => s.Servo360(port,direction,speed), port,ticks);
        }
    }
    b.pulse(() => s.Servo360Stop(port), port,348);
    b.pulse(() => s.Servo360(port,99,100), port,348);
}
// Check every physical-angle request and fractional speed for quantization,
// monotonicity, and staying inside the configured endpoints.
for (let angle = 0; angle <= 180; angle++) {
    b.writes.length = 0; s.Servo180(0,angle);
    const bytes = b.writes[0].bytes;
    const us = (bytes[3]+256*bytes[4])*4.88;
    assert.ok(Math.abs(us-(1000+angle*1000/180)) <= 2.44+1e-8);
}
for (let speed = 0; speed <= 100; speed += 0.5) {
    b.writes.length = 0; s.Servo360(0,s.ServoDirection.Forward,speed);
    const bytes = b.writes[0].bytes;
    const us = (bytes[3]+256*bytes[4])*4.88;
    assert.ok(Math.abs(us-(1700-speed*9)) <= 2.44+1e-8);
}
for (const port of [-1,8,0.5,NaN,Infinity,-Infinity]) {
    b.silent(() => s.Servo180(port,90));
    b.silent(() => s.Servo360(port,1,50));
    b.silent(() => s.Servo360Stop(port));
    b.silent(() => s.CalibrateServo180(port,500,3000));
    b.silent(() => s.CalibrateServo360(port,800,1750,2600));
}
// Calibration is per port and per servo type. Positional config does not move.
b.silent(() => s.CalibrateServo180(7,600,3040));
b.pulse(() => s.Servo180(7,180),7,623);
b.pulse(() => s.Servo180(7,90),7,373);
b.pulse(() => s.Servo180(0,180),0,410);
b.pulse(() => s.Servo360Stop(7),7,348);
for (const [min,max] of [[499,2000],[1000,3101],[2000,1000],[1500,1500],
    [NaN,2000],[1000,NaN],[-Infinity,2000],[1000,Infinity]]) {
    b.silent(() => s.CalibrateServo180(7,min,max));
    b.pulse(() => s.Servo180(7,180),7,623);
}
b.pulse(() => s.CalibrateServo360(7,800,1750,2600),7,359);
b.pulse(() => s.Servo360(7,1,0),7,359);
b.pulse(() => s.Servo360(7,2,0),7,359);
b.pulse(() => s.Servo360Stop(7),7,359);
b.pulse(() => s.Servo360Stop(0),0,348);
b.pulse(() => s.Servo360(7,1,100),7,164);
b.pulse(() => s.Servo360(7,2,100),7,533);
for (const args of [[499,1700,2600],[800,1700,3101],[1700,800,2600],
    [800,2600,1700],[800,800,2600],[800,1700,1700],[NaN,1700,2600],
    [800,NaN,2600],[800,1700,NaN],[-Infinity,1700,2600],[800,1700,Infinity]]) {
    b.silent(() => s.CalibrateServo360(7,...args));
    b.pulse(() => s.Servo360Stop(7),7,359);
}
// Every port accepts its own calibration without affecting another port.
for (let port = 0; port < 8; port++) {
    const boardState = board(source), api = boardState.api;
    boardState.silent(() => api.CalibrateServo180(port,600,3040));
    boardState.pulse(() => api.Servo180(port,180),port,623);
    boardState.pulse(() => api.Servo180((port+1)%8,180),(port+1)%8,410);
    boardState.pulse(() => api.CalibrateServo360(port,800,1750,2600),port,359);
    boardState.pulse(() => api.Servo360Stop((port+1)%8),(port+1)%8,348);
}
// Endpoints of the accepted signal envelope; no automatic extension to them.
b.silent(() => s.CalibrateServo180(1,500,3100));
b.pulse(() => s.Servo180(1,-100),1,102);
b.pulse(() => s.Servo180(1,999),1,635);
const fresh = board(source);
fresh.pulse(() => fresh.api.Servo360Stop(7),7,348);
const prescale = fresh.writes.find(w => w.bytes[0] === 0xfe);
assert.deepEqual(prescale, { address: 0x40, bytes: [0xfe,121] });
// Compare emitted I2C bytes against the original repository, including legacy
// out-of-slider-range values supplied by old JavaScript/Python projects.
const legacy = board(execFileSync('git', ['show','2dc96afd11a4510601a9c4f55b94ae4b1a6ec229:main.ts'], {encoding:'utf8'}));
const current = board(source);
for(let port=0;port<8;port++) {
    for(const name of ['Servo','Servo2','Servo3','Servo4']) {
        for(const value of [-10,0,45,90,115,180,244,270,360]) {
            for(const direction of [1,2,3]) {
                legacy.writes.length=0;current.writes.length=0;
                const args=name==='Servo'||name==='Servo2'?[port,value]:[port,direction,value];
                legacy.api[name](...args);current.api[name](...args);
                assert.deepEqual(current.writes,legacy.writes,`${name}(${args}) changed`);
            }
        }
    }
}
console.log('PASS: all 8 ports; angle/speed mapping; clamping; invalid ports; calibration; neutral/stop; PCA9685 bytes; 864 legacy comparisons');
