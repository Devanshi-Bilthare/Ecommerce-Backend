const cloudinary = require("cloudinary").v2; // Make sure to use cloudinary.v2 for latest methods

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});

const cloudinaryUploadImg = async (fileToUploads) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      fileToUploads,
      { resource_type: "auto" }, // Correctly pass resource_type here
      (error, result) => {
        if (error) {
          reject(error); // Reject promise if there's an error
        } else {
          resolve({
            url: result.secure_url,
            asset_id: result.asset_id,
            public_id: result.public_id,
          });
        }
      }
    );
  });
};

const cloudinaryDeleteImg = async (fileToDelete) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      fileToDelete,
      { resource_type: "image" }, // Typically "image", ensure correct usage based on your files
      (error, result) => {
        if (error) {
          reject(error); // Reject promise if there's an error
        } else {
          resolve(result);
        }
      }
    );
  });
};

module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg };
