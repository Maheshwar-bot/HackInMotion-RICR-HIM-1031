const cloudinary = require("../config/cloudinary");

const uploadPrescription = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "medimitra/prescriptions",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

module.exports = {
  uploadPrescription,
};