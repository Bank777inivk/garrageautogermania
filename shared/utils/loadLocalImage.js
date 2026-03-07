/**
 * Fetches a local image from the /public folder and returns its base64 data URL.
 * @param {string} path - Path relative to public folder, e.g. '/garrage_stamp_pro.png'
 * @returns {Promise<string>} base64 data URL
 */
export const loadLocalImage = async (path) => {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to fetch ${path}`);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error('loadLocalImage error:', e);
        return null;
    }
};
