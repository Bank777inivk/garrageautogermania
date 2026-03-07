import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const SEARCH_DIRS = ['admin/src', 'client/src', 'shared'];
const EXTENSIONS_TO_REPLACE = ['.png', '.jpg', '.jpeg'];

function updateReferences(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            updateReferences(filePath);
        } else {
            const ext = path.extname(file).toLowerCase();
            // Only process text-based files
            if (['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.md', '.json'].includes(ext)) {
                let content = fs.readFileSync(filePath, 'utf8');
                let modified = false;

                EXTENSIONS_TO_REPLACE.forEach(oldExt => {
                    // Case-insensitive replacement for .png, .jpg, .jpeg with .webp
                    const regex = new RegExp(`\\${oldExt}`, 'gi');
                    if (regex.test(content)) {
                        content = content.replace(regex, '.webp');
                        modified = true;
                    }
                });

                if (modified) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`✅ Updated references in: ${path.relative(ROOT_DIR, filePath)}`);
                }
            }
        }
    }
}

console.log('🚀 Updating image references to .webp...');
SEARCH_DIRS.forEach(dir => {
    const fullPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullPath)) {
        updateReferences(fullPath);
    }
});
console.log('✨ Reference update complete!');
