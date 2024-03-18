const cloudinary = require('cloudinary').v2

exports.uploadImageToCloudinary = async (file, folder, quality) => {
    const options = { folder };
    if (quality) {
        options.quality = quality;
    }
    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
};

exports.destroyImageToCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (err) {
        console.log("Error deleting user's image from Cloudinary");
        console.log(err);
    }
};

// File format -> handler controller
exports.isFileTypeSupported = (fileName, supportedTypes) => {
    const fileType = fileName.split('.')[1].toLowerCase();
    return supportedTypes.includes(fileType);
};