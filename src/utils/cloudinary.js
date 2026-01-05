import axios from 'axios';

export const uploadToCloudinary = async (file, preset) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate preset
    if (!preset) {
      console.error('Upload preset is missing. Environment variables:', {
        cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
        portfolioPreset: process.env.REACT_APP_CLOUDINARY_PORTFOLIO_PRESET,
        certificatePreset: process.env.REACT_APP_CLOUDINARY_CERTIFICATE_PRESET,
      });
      throw new Error('Upload preset is required. Please check your .env file and restart the app.');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);

    // Build upload URL with cloud name
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    if (response.data && response.data.secure_url) {
      return response.data.secure_url;
    } else {
      throw new Error('Invalid response from Cloudinary');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    
    // Provide more detailed error messages
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.error?.message || error.response.statusText;
      throw new Error(`Cloudinary upload failed: ${errorMessage} (Status: ${error.response.status})`);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Cloudinary upload failed: No response from server. Please check your internet connection.');
    } else {
      // Error in request setup
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }
};
