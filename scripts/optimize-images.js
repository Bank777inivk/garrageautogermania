import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const MAX_WIDTH = 1600;
const QUALITY = 75;

async function optimizeImages(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            await optimizeImages(filePath);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (SUPPORTED_EXTENSIONS.includes(ext) && !file.startsWith('temp_')) {
                const outputFileName = file.toLowerCase().endsWith('.webp') ? file : file.substring(0, file.lastIndexOf('.')) + '.webp';
                const outputPath = path.join(directory, outputFileName);
                const tempPath = path.join(directory, 'temp_' + Date.now() + '_' + outputFileName);

                try {
                    const originalSize = stats.size;

                    // Read into buffer to avoid file lock on Windows
                    const buffer = fs.readFileSync(filePath);
                    const metadata = await sharp(buffer).metadata();

                    let pipeline = sharp(buffer);
                    if (metadata.width > MAX_WIDTH) {
                        pipeline = pipeline.resize(MAX_WIDTH);
                    }

                    await pipeline
                        .webp({ quality: QUALITY })
                        .toFile(tempPath);

                    const newSize = fs.statSync(tempPath).size;

                    if (newSize < originalSize || ext !== '.webp') {
                        // Replace original if the new one is smaller, OR if we are converting from another format
                        if (fs.existsSync(outputPath) && outputPath !== filePath) {
                            fs.unlinkSync(outputPath);
                        }
                        // If it's the same file (re-optimizing WebP), we need to ensure the original is closed
                        // Buffer approach handles this.
                        if (fs.existsSync(filePath) && ext === '.webp') {
                            fs.unlinkSync(filePath);
                        }
                        fs.renameSync(tempPath, outputPath);

                        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
                        console.log(`✅ Optimized: ${file} -> ${outputFileName} (-${reduction}%)`);

                        // Cleanup original if it was a different format
                        if (ext !== '.webp' && fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    } else {
                        console.log(`ℹ️ Already optimal: ${file}`);
                        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                    }
                } catch (error) {
                    console.error(`❌ Error ${file}:`, error.message);
                    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                }
            }
        }
    }
}

console.log('🚀 Starting advanced optimization (Resize to 1600px + Q75)...');
optimizeImages(PUBLIC_DIR)
    .then(() => console.log('✨ Image optimization complete!'))
    .catch(err => console.error('💥 Fatal error:', err));
