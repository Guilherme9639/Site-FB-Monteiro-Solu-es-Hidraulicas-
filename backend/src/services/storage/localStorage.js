import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.resolve(currentDirectory, "../../../uploads");

function absolutePath(storageKey) {
  const resolved = path.resolve(uploadsDirectory, storageKey);

  if (
    resolved !== uploadsDirectory &&
    !resolved.startsWith(`${uploadsDirectory}${path.sep}`)
  ) {
    throw new Error("Caminho de armazenamento inválido.");
  }

  return resolved;
}

export async function upload({ buffer, storageKey }) {
  const destination = absolutePath(storageKey);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, buffer, { flag: "wx" });
  return storageKey;
}

export async function remove(storageKey) {
  try {
    await unlink(absolutePath(storageKey));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

export function getPath(storageKey) {
  return absolutePath(storageKey);
}
