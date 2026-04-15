import { uploadToCloudinary } from '@/lib/cloudinary';

export const uploadService = {
    /**
     * Uploads a file to Cloudinary
     * @param file The file object to upload
     * @returns The public URL of the uploaded file
     */
    uploadFile: async (file: File): Promise<string> => {
        try {
            const url = await uploadToCloudinary(file);

            if (!url) {
                throw new Error('Failed to get URL from Cloudinary');
            }

            return url;
        } catch (error) {
            console.error('Upload failed:', error);
            throw new Error('Failed to upload file. Please try again.');
        }
    }
};
