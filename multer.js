const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    const filename =
      Date.now() + Math.floor(Math.random() * 100) + file.originalname.replace(/ /g, "");
    callback(null, filename);
  },
  destination: (req, file, callback) => {
    const uploadPath = "storage";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    callback(null, uploadPath);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;