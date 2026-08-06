import path from "node:path";
import { MAX_IMAGE_SIZE_BYTES } from "../../config/constants.js";
import { httpError } from "../../utils/httpError.js";

const allowedTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
]);

function detectMimeType(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return "image/png";
  }

  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) {
    return "image/jpeg";
  }

  return null;
}

export function validateImageFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const expectedMimeType = allowedTypes.get(extension);
  const detectedMimeType = detectMimeType(file.buffer);

  if (!expectedMimeType || file.mimetype !== expectedMimeType) {
    throw httpError(400, "A imagem deve ser JPG ou PNG com extensão e MIME compatíveis.");
  }

  if (detectedMimeType !== expectedMimeType) {
    throw httpError(400, "O conteúdo do arquivo não corresponde ao tipo informado.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw httpError(413, "A imagem excede o limite permitido.");
  }

  return {
    extension: extension === ".jpeg" ? ".jpg" : extension,
    mimeType: expectedMimeType,
  };
}
