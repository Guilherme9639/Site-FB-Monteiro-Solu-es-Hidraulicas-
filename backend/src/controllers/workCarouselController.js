import { randomUUID } from "node:crypto";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import { MAX_IMAGES_PER_WORK_CAROUSEL } from "../config/constants.js";
import { getPath, upload, remove } from "../services/storage/localStorage.js";
import { validateImageFile } from "../services/storage/imageValidation.js";
import { httpError } from "../utils/httpError.js";
import {
  mapWorkCarouselImage,
  mapWorkCarouselProject,
} from "../utils/responseMappers.js";

const CONFIG_ID = "work-carousel-config";
const VALID_MODES = new Set(["CUSTOM", "PROJECT"]);

const configInclude = {
  images: {
    orderBy: { displayOrder: "asc" },
  },
  selectedProject: {
    include: {
      images: {
        orderBy: { displayOrder: "asc" },
      },
      _count: { select: { images: true } },
    },
  },
};

async function getOrCreateConfig() {
  return prisma.workCarouselConfig.upsert({
    where: { id: CONFIG_ID },
    create: { id: CONFIG_ID },
    update: {},
    include: configInclude,
  });
}

function normalizeMode(value, fallback = "CUSTOM") {
  const mode = value ?? fallback;
  if (!VALID_MODES.has(mode)) {
    throw httpError(400, "O modo do carrossel deve ser CUSTOM ou PROJECT.");
  }
  return mode;
}

function normalizeDescription(description) {
  if (description === undefined || description === null || description === "") {
    return null;
  }

  const normalized = String(description).trim();
  if (normalized.length > 2000) {
    throw httpError(400, "A descriÃ§Ã£o da imagem deve ter no mÃ¡ximo 2000 caracteres.");
  }
  return normalized || null;
}

function mapConfig(config) {
  return {
    id: config.id,
    mode: config.mode,
    selectedProject: mapWorkCarouselProject(config.selectedProject),
    images: config.images.map((image) => mapWorkCarouselImage(image, { admin: true })),
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
}

export async function getAdminWorkCarousel(request, response, next) {
  try {
    const config = await getOrCreateConfig();
    return response.status(200).json({ config: mapConfig(config) });
  } catch (error) {
    return next(error);
  }
}

export async function updateAdminWorkCarousel(request, response, next) {
  try {
    const current = await getOrCreateConfig();
    const mode = normalizeMode(request.body?.mode, current.mode);
    const selectedProjectId = request.body?.selectedProjectId === undefined
      ? current.selectedProjectId
      : request.body.selectedProjectId || null;

    if (mode === "PROJECT") {
      if (!selectedProjectId) {
        throw httpError(400, "Selecione um projeto publicado para o carrossel.");
      }

      const project = await prisma.project.findFirst({
        where: { id: selectedProjectId, isVisible: true },
        select: { id: true },
      });

      if (!project) {
        throw httpError(400, "O projeto selecionado nÃ£o estÃ¡ publicado ou nÃ£o existe.");
      }
    }

    const config = await prisma.workCarouselConfig.update({
      where: { id: current.id },
      data: { mode, selectedProjectId },
      include: configInclude,
    });

    return response.status(200).json({ config: mapConfig(config) });
  } catch (error) {
    return next(error);
  }
}

export async function addWorkCarouselImages(request, response, next) {
  const files = request.files ?? [];

  try {
    if (files.length === 0) {
      throw httpError(400, "Envie pelo menos uma imagem no campo images.");
    }

    const config = await getOrCreateConfig();
    const currentCount = await prisma.workCarouselImage.count({
      where: { configId: config.id },
    });

    if (currentCount + files.length > MAX_IMAGES_PER_WORK_CAROUSEL) {
      throw httpError(
        400,
        `O carrossel pode ter no mÃ¡ximo ${MAX_IMAGES_PER_WORK_CAROUSEL} imagens.`,
      );
    }

    const uploadedKeys = [];
    const createdImages = [];

    try {
      for (const [index, file] of files.entries()) {
        const { extension, mimeType } = validateImageFile(file);
        const imageId = randomUUID();
        const storageKey = path.posix.join(
          "work-carousel",
          `${imageId}${extension}`,
        );

        await upload({ buffer: file.buffer, storageKey });
        uploadedKeys.push(storageKey);

        const image = await prisma.workCarouselImage.create({
          data: {
            id: imageId,
            configId: config.id,
            url: `/api/media/work-carousel/${imageId}`,
            storageKey,
            originalName: path.basename(file.originalname),
            mimeType,
            size: file.size,
            displayOrder: currentCount + index,
          },
        });

        createdImages.push(mapWorkCarouselImage(image, { admin: true }));
      }
    } catch (error) {
      await Promise.all(uploadedKeys.map((storageKey) => remove(storageKey)));
      throw error;
    }

    return response.status(201).json({ images: createdImages });
  } catch (error) {
    return next(error);
  }
}

export async function updateWorkCarouselImage(request, response, next) {
  try {
    const image = await prisma.workCarouselImage.findUnique({
      where: { id: request.params.imageId },
    });

    if (!image) {
      return response.status(404).json({ message: "Imagem nÃ£o encontrada." });
    }

    const data = {};
    if (request.body?.description !== undefined) {
      data.description = normalizeDescription(request.body.description);
    }
    if (request.body?.isVisible !== undefined) {
      if (typeof request.body.isVisible !== "boolean") {
        throw httpError(400, "A visibilidade deve ser booleana.");
      }
      data.isVisible = request.body.isVisible;
    }

    if (Object.keys(data).length === 0) {
      throw httpError(400, "Nenhum campo vÃ¡lido foi enviado para atualizaÃ§Ã£o.");
    }

    const updated = await prisma.workCarouselImage.update({
      where: { id: image.id },
      data,
    });

    return response.status(200).json({
      image: mapWorkCarouselImage(updated, { admin: true }),
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteWorkCarouselImage(request, response, next) {
  try {
    const image = await prisma.workCarouselImage.findUnique({
      where: { id: request.params.imageId },
    });

    if (!image) {
      return response.status(404).json({ message: "Imagem nÃ£o encontrada." });
    }

    await remove(image.storageKey);
    await prisma.workCarouselImage.delete({ where: { id: image.id } });
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function reorderWorkCarouselImages(request, response, next) {
  try {
    const imageIds = request.body?.imageIds;

    if (
      !Array.isArray(imageIds) ||
      imageIds.length === 0 ||
      new Set(imageIds).size !== imageIds.length
    ) {
      throw httpError(400, "Envie uma lista Ãºnica de imageIds.");
    }

    const config = await getOrCreateConfig();
    const images = await prisma.workCarouselImage.findMany({
      where: { configId: config.id },
      select: { id: true },
    });
    const storedIds = new Set(images.map((image) => image.id));

    if (
      storedIds.size !== imageIds.length ||
      imageIds.some((imageId) => !storedIds.has(imageId))
    ) {
      throw httpError(400, "A ordenaÃ§Ã£o deve conter exatamente as imagens do carrossel.");
    }

    await prisma.$transaction(
      imageIds.map((imageId, displayOrder) =>
        prisma.workCarouselImage.update({
          where: { id: imageId },
          data: { displayOrder },
        }),
      ),
    );

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function getPublicWorkCarousel(request, response, next) {
  try {
    const config = await prisma.workCarouselConfig.findUnique({
      where: { id: CONFIG_ID },
      include: {
        images: {
          where: { isVisible: true },
          orderBy: { displayOrder: "asc" },
        },
        selectedProject: {
          include: {
            images: {
              where: { isVisible: true },
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
    });

    if (!config) {
      return response.status(200).json({
        mode: "CUSTOM",
        project: null,
        images: [],
      });
    }

    const publicProject = config.mode === "PROJECT" && config.selectedProject?.isVisible
      ? config.selectedProject
      : null;
    const images = config.mode === "PROJECT"
      ? (publicProject?.images ?? [])
      : config.images;

    return response.status(200).json({
      mode: config.mode,
      project: mapWorkCarouselProject(publicProject),
      images: images.map((image) => mapWorkCarouselImage(image)),
    });
  } catch (error) {
    return next(error);
  }
}

export async function serveWorkCarouselImage(request, response, next) {
  try {
    const image = await prisma.workCarouselImage.findUnique({
      where: { id: request.params.imageId },
      include: { config: true },
    });

    const isPubliclyAvailable = image?.config.mode === "CUSTOM" && image.isVisible;
    if (!image || (!request.user && !isPubliclyAvailable)) {
      return response.status(404).json({ message: "Imagem nÃ£o encontrada." });
    }

    return response.sendFile(getPath(image.storageKey));
  } catch (error) {
    return next(error);
  }
}
