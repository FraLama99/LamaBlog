import imageCompression from 'browser-image-compression';

export const compressImage = async (file, options = {}) => {
    const defaultOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
    };

    try {
        return await imageCompression(file, { ...defaultOptions, ...options });
    } catch (error) {
        console.error("Errore nella compressione dell'immagine:", error);
        throw error;
    }
};