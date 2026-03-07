import sharp from 'sharp';
import fs from 'fs';

async function test() {
    try {
        const input = 'public/audi.webp';
        const output = 'public/audi_test.webp';
        console.log('Testing sharp on:', input);

        // Check if sharp is a function
        console.log('Sharp type:', typeof sharp);
        const s = typeof sharp === 'function' ? sharp : sharp.default;
        console.log('S type:', typeof s);

        const metadata = await s(input).metadata();
        console.log('Original width:', metadata.width);

        await s(input)
            .resize(1600)
            .webp({ quality: 75 })
            .toFile(output);

        const newMetadata = await s(output).metadata();
        console.log('New width:', newMetadata.width);
        console.log('New size:', fs.statSync(output).size);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
