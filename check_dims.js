import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'public';
try {
    const allFiles = fs.readdirSync(dir);
    const webpFiles = allFiles.filter(f => f.toLowerCase().endsWith('.webp'));

    for (const f of webpFiles) {
        const m = await sharp(path.join(dir, f)).metadata();
        console.log(`${f}: ${m.width}x${m.height}`);
    }
} catch (e) {
    console.log('Error:', e.message);
}
