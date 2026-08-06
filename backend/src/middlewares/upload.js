import multer from "multer";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES_PER_PROJECT } from "../config/constants.js";
import { httpError } from "../utils/httpError.js";

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: MAX_IMAGES_PER_PROJECT,
  },
  fileFilter(request, file, callback) {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) {
      return callback(null, true);
    }

    return callback(httpError(400, "Apenas imagens JPG e PNG são permitidas."));
  },
});
