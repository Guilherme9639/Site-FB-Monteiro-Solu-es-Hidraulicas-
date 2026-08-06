import { randomUUID } from "node:crypto";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import { SITE_IMAGE_SECTIONS } from "../config/constants.js";
import { upload, remove } from "../services/storage/localStorage.js";
import { validateImageFile } from "../services/storage/imageValidation.js";
import { httpError } from "../utils/httpError.js";
import { mapSiteImage } from "../utils/responseMappers.js";

function getKeyConfig(key) {
  const section = SITE_IMAGE_SECTIONS[key];

  if (!section) {
    throw httpError(404, "A chave da imagem não está configurada.");
  }

  return section;
}

function parseVisibility(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") {
    throw httpError(400, "A visibilidade deve ser booleana.");
  }
  return value;
}

function normalizeDescription(description) {
  if (description === undefined || description === null || description === "") {
    return null;
  }

  const normalized = String(description).trim();
  if (normalized.length > 2000) {
    throw httpError(400, "A descrição deve ter no máximo 2000 caracteres.");
  }
  return normalized || null;
}

export async function listAdminSiteImages(request, response, next) {
  try {
    const images = await prisma.siteImage.findMany({ orderBy: { key: "asc" } });
    return response.status(200).json({
      images: images.map((image) => mapSiteImage(image, { admin: true })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function upsertSiteImage(request, response, next) {
  const file = request.file;

  try {
    if (!file) {
      throw httpError(400, "Envie uma imagem no campo image.");
    }

    const section = getKeyConfig(request.params.key);
    const { extension, mimeType } = validateImageFile(file);
    const current = await prisma.siteImage.findUnique({
      where: { key: request.params.key },
    });
    const imageId = current?.id ?? randomUUID();
    const storageKey = path.posix.join(
      "site",
      `${imageId}-${randomUUID()}${extension}`,
    );

    await upload({ buffer: file.buffer, storageKey });

    try {
      const image = await prisma.siteImage.upsert({
        where: { key: request.params.key },
        update: {
          section,
          url: `/api/media/site/${imageId}`,
          storageKey,
          originalName: path.basename(file.originalname),
          mimeType,
          size: file.size,
          description: normalizeDescription(request.body?.description),
          isVisible: parseVisibility(request.body?.isVisible, current?.isVisible ?? true),
        },
        create: {
          id: imageId,
          key: request.params.key,
          section,
          url: `/api/media/site/${imageId}`,
          storageKey,
          originalName: path.basename(file.originalname),
          mimeType,
          size: file.size,
          description: normalizeDescription(request.body?.description),
          isVisible: parseVisibility(request.body?.isVisible, true),
        },
      });

      if (current) {
        await remove(current.storageKey);
      }

      return response.status(current ? 200 : 201).json({
        image: mapSiteImage(image, { admin: true }),
      });
    } catch (error) {
      await remove(storageKey);
      throw error;
    }
  } catch (error) {
    return next(error);
  }
}

export async function updateSiteImage(request, response, next) {
  try {
    const image = await prisma.siteImage.findUnique({
      where: { id: request.params.imageId },
    });

    if (!image) {
      return response.status(404).json({ message: "Imagem não encontrada." });
    }

    const data = {};
    if (request.body?.description !== undefined) {
      data.description = normalizeDescription(request.body.description);
    }
    if (request.body?.isVisible !== undefined) {
      data.isVisible = parseVisibility(request.body.isVisible);
    }

    if (Object.keys(data).length === 0) {
      throw httpError(400, "Nenhum campo válido foi enviado para atualização.");
    }

    const updated = await prisma.siteImage.update({
      where: { id: image.id },
      data,
    });

    return response.status(200).json({
      image: mapSiteImage(updated, { admin: true }),
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSiteImage(request, response, next) {
  try {
    const image = await prisma.siteImage.findUnique({
      where: { id: request.params.imageId },
    });

    if (!image) {
      return response.status(404).json({ message: "Imagem não encontrada." });
    }

    await remove(image.storageKey);
    await prisma.siteImage.delete({ where: { id: image.id } });
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
}
