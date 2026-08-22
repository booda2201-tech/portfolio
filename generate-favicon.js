import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(fileURLToPath(import.meta.url));
const publicDir = join(root, 'public');
const outputPath = join(publicDir, 'favicon.png');
const candidates = [
    join(publicDir, 'profile.jpg'),
    join(publicDir, 'profile.jpeg'),
    join(publicDir, 'profile.png')
];

const SIZE = 512;
const PAD_RATIO = 0.15;

const inputPath = candidates.find((path) => existsSync(path));
if (!inputPath) {
    console.error('Missing profile image. Add public/profile.jpg or public/profile.png, then rerun.');
    process.exit(1);
}

mkdirSync(publicDir, { recursive: true });

const pad = Math.round(SIZE * PAD_RATIO);
const inner = SIZE - pad * 2;
const radius = inner / 2;
const circleMask = Buffer.from(
    `<svg width="${inner}" height="${inner}" viewBox="0 0 ${inner} ${inner}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${radius}" cy="${radius}" r="${radius - 0.5}" fill="#fff"/>
    </svg>`
);

const circular = await sharp(inputPath)
    .rotate()
    .resize(inner, inner, { fit: 'cover', position: 'attention' })
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

await sharp({
    create: {
        width: SIZE,
        height: SIZE,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
})
    .composite([{ input: circular, left: pad, top: pad }])
    .png()
    .toFile(outputPath);

console.log(`Wrote ${SIZE}x${SIZE} favicon with ${Math.round(PAD_RATIO * 100)}% padding → ${outputPath}`);
