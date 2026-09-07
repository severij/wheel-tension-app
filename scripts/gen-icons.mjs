// Generates simple bicycle-wheel-style PNG icons for PWA. Produces a solid
// teal square with a white rim ring and radial spoke lines radiating from the
// center — a lightweight, dependency-free placeholder for the app icon.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '..', 'public')

// Theme colors
const BG_R = 0x1f
const BG_G = 0x8a
const BG_B = 0x70
const FG_R = 0xff
const FG_G = 0xff
const FG_B = 0xff

function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function drawWheel(size, px) {
  // pixels row-major RGBA
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const on = sample(x, y, size)
      px[i] = on ? FG_R : BG_R
      px[i + 1] = on ? FG_G : BG_G
      px[i + 2] = on ? FG_B : BG_B
      px[i + 3] = 0xff
    }
  }
}

function sample(x, y, size) {
  const cx = size / 2 - 0.5
  const cy = size / 2 - 0.5
  const r = Math.hypot(x - cx, y - cy)
  const R = size * 0.46 // outer rim radius
  const ringW = size * 0.05
  const hubR = size * 0.06
  const spokeCount = 8
  let ang = Math.atan2(y - cy, x - cx)
  if (ang < 0) ang += Math.PI * 2

  // outer rim ring
  if (Math.abs(r - R) < ringW) return 1
  // hub
  if (r < hubR) return 1

  // spokes: lines from hub to rim
  for (let k = 0; k < spokeCount; k++) {
    const a0 = (k / spokeCount) * Math.PI * 2
    const a1 = ((k + 0.5) / spokeCount) * Math.PI * 2
    // distance from the spoke segment to (cx,cy)->slant lines; approximate by angle
    // near the spoke line direction
    const dAngle = angDist(ang, a0)
    if (dAngle < 0.035 && r > hubR && r < R) return 1
    const dAngle2 = angDist(ang, a1)
    if (dAngle2 < 0.035 && r > hubR && r < R) return 1
  }
  return 0
}

function angDist(a, b) {
  let d = Math.abs(a - b)
  d = d % (Math.PI * 2)
  if (d > Math.PI) d = Math.PI * 2 - d
  return d
}

function pngOf(size) {
  const px = new Uint8Array(size * size * 4)
  drawWheel(size, px)
  const stride = 1 + size * 4
  const raw = Buffer.alloc(size * stride)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4
      const dst = y * stride + 1 + x * 4
      raw[dst] = px[src]
      raw[dst + 1] = px[src + 1]
      raw[dst + 2] = px[src + 2]
      raw[dst + 3] = px[src + 3]
    }
  }
  const idat = deflateSync(raw)
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6 // RGBA
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

mkdirSync(outDir, { recursive: true })

const specs = [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['pwa-maskable-512x512.png', 512],
  ['apple-touch-icon.png', 180],
]

for (const [name, size] of specs) {
  writeFileSync(path.join(outDir, name), pngOf(size))
  console.log(`wrote ${name} (${size}x${size})`)
}
