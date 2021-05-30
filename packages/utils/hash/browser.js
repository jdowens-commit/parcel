import xxhash from 'xxhash-wasm';

let h64, h64Raw;
export async function init() {
  ({h64, h64Raw} = await xxhash());
}

const encoder = new TextEncoder();
export function hashString(s) {
  return toHex(h64Raw(encoder.encode(s)));
}
export function hashBuffer(b) {
  return toHex(h64Raw(b));
}
export class Hash {
  constructor() {
    this.data = [];
  }
  writeString(s) {
    this.data.push(encoder.encode(s));
  }
  writeBuffer(b) {
    this.data.push(b);
  }
  finish() {
    return hashBuffer(concatUint8Arrays(this.data));
  }
}

function concatUint8Arrays(arrays) {
  let totalLength = 0;
  for (let a of arrays) {
    totalLength += a.byteLength;
  }
  let result = new Uint8Array(totalLength);
  let offset = 0;
  for (let a of arrays) {
    result.set(a, offset);
    offset += a.byteLength;
  }
  return result;
}

// https://blog.xaymar.com/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
const LUT_HEX_4b = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
];
const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
  LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xf]}${LUT_HEX_4b[n & 0xf]}`;
}
function toHex(buffer) {
  let out = '';
  for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
    out += LUT_HEX_8b[buffer[idx]];
  }
  return out;
}
