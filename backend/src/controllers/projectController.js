import { randomUUID } from "node:crypto";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import { MAX_IMAGES_PER_PROJECT } from "../config/constants.js";
import { upload, remove } from "../services/storage/localStorage.js";
import { validateImageFile } from "../services/storage/imageValidation.js";
import { createUniqueSlug } from "../utils/slug.js";
import { httpError } from "../utils/httpError.js";
import { mapProject } from "../utils/responseMappers.js";

const projectInclude = {
  images: {
    orderBy: { displayOrder: "asc" },
  },
};

function validateTitle(title) {
  const normalized = title?.trim();

  if (!normalized || normalized.length < 3 || normalized.length > 160) {
    throw httpError(400, "O título deve ter entre 3 e 160 caracteres.");
  }

  return normalized;
}

function normalizeDescription(description) {
  if (description === undefined || description === null || description === "") {
    return null;
  }

  const normalized = String(description).trim();

  if (normalized.length > 5000) {
    throw httpError(400, "A descrição deve ter no máximo 5000 caracteres.");
  }

  return normalized || null;
}

function parseVisibility(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "boolean") {
    throw httpError(400, "A visibilidade deve ser booleana.");
  }

  return value;
}

export async function listAdminProjects(request, response, next) {
  try {
    const projects = await prisma.project.findMany({
      include: projectInclude,
      orderBy: { createdAt: "desc" },
    });

    return response.status(200).json({
      projects: projects.map((project) => mapProject(project, { admin: true })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminProject(request, response, next) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: request.params.projectId },
      include: projectInclude,
    });

    if (!project) {
      return response.status(404).json({ message: "Projeto não encontrado." });
    }

    return response.status(200).json({
      project: mapProject(project, { admin: true }),
    });
  } catch (error) {
    return next(error);
  }
}

export async function createProject(request, response, next) {
  try {
    const title = validateTitle(request.body?.title);
    const description = normalizeDescription(request.body?.description);
    const isVisible = parseVisibility(request.body?.isVisible, false);
    const slug = await createUniqueSlug(prisma, title);

    const project = await prisma.project.create({
      data: { title, description, slug, isVisible },
      include: projectInclude,
    });

    return response.status(201).json({
      project: mapProject(project, { admin: true }),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProject(request, response, next) {
  try {
    const current = await prisma.project.findUnique({
      where: { id: request.params.projectId },
    });

    if (!current) {
      return response.status(404).json({ message: "Projeto não encontrado." });
    }

    const data = {};

    if (request.body?.title !== undefined) {
      data.title = validateTitle(request.body.title);
    }

    if (request.body?.description !== undefined) {
      data.description = normalizeDescription(request.body.description);
    }

    if (request.body?.isVisible !== undefined) {
      data.isVisible = parseVisibility(request.body.isVisible);
    }

    if (Object.keys(data).length === 0) {
      throw httpError(400, "Nenhum campo válido foi enviado para atualização.");
    }

    const project = await prisma.project.update({
      where: { id: current.id },
      data,
      include: projectInclude,
    });

    return response.status(200).json({
      project: mapProject(project, { admin: true }),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProjectVisibility(request, response, next) {
  try {
    const isVisible = parseVisibility(request.body?.isVisible);

    if (typeof isVisible !== "boolean") {
      throw httpError(400, "Informe a visibilidade do projeto.");
    }

    const project = await prisma.project.update({
      where: { id: request.params.projectId },
      data: { isVisible },
      include: projectInclude,
    });

    return response.status(200).json({
      project: mapProject(project, { admin: true }),
    });
  } catch (error) {
    if (error.code === "P2025") {
      return response.status(404).json({ message: "Projeto não encontrado." });
    }
    return next(error);
  }
}

export async function deleteProject(request, response, next) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: request.params.projectId },
      include: { images: true },
    });

    if (!project) {
      return response.status(404).json({ message: "Projeto não encontrado." });
    }

    for (const image of project.images) {
      await remove(image.storageKey);
    }

    await prisma.project.delete({ where: { id: project.id } });
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function addProjectImages(request, response, next) {
  const files = request.files ?? [];

  try {
    if (files.length === 0) {
      throw httpError(400, "Envie pelo menos uma imagem no campo images.");
    }

    const project = await prisma.project.findUnique({
      where: { id: request.params.projectId },
      include: { images: { orderBy: { displayOrder: "desc" }, take: 1 } },
    });

    if (!project) {
      throw httpError(404, "Projeto não encontrado.");
    }

    const currentCount = await prisma.projectImage.count({
      where: { projectId: project.id },
    });

    if (currentCount + files.length > MAX_IMAGES_PER_PROJECT) {
      throw httpError(
        400,
        `O projeto pode ter no máximo ${MAX_IMAGES_PER_PROJECT} imagens.`,
      );
    }

    const uploadedKeys = [];
    const createdImages = [];

    try {
      for (const [index, file] of files.entries()) {
        const { extension, mimeType } = validateImageFile(file);
        const imageId = randomUUID();
        const storageKey = path.posix.join(
          "projects",
          project.id,
          `${imageId}${extension}`,
        );

        await upload({ buffer: file.buffer, storageKey });
        uploadedKeys.push(storageKey);

        const image = await prisma.projectImage.create({
          data: {
            id: imageId,
            projectId: project.id,
            url: `/api/media/projects/${imageId}`,
            storageKey,
            originalName: path.basename(file.originalname),
            mimeType,
            size: file.size,
            displayOrder: currentCount + index,
            isCover: currentCount === 0 && index === 0,
          },
        });

        createdImages.push(image);
      }
    } catch (error) {
      await Promise.all(uploadedKeys.map((storageKey) => remove(storageKey)));
      throw error;
    }

    return response.status(201).json({
      images: createdImages,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProjectImage(request, response, next) {
  try {
    const image = await prisma.projectImage.findUnique({
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

    if (request.body?.isCover !== undefined) {
      data.isCover = parseVisibility(request.body.isCover);
    }

    if (Object.keys(data).length === 0) {
      throw httpError(400, "Nenhum campo válido foi enviado para atualização.");
    }

    const updated = await prisma.$transaction(async (transaction) => {
      if (data.isCover === true) {
        await transaction.projectImage.updateMany({
          where: { projectId: image.projectId },
          data: { isCover: false },
        });
      }

      return transaction.projectImage.update({
        where: { id: image.id },
        data,
      });
    });

    return response.status(200).json({ image: updated });
  } catch (error) {
    return next(error);
  }
}

export async function deleteProjectImage(request, response, next) {
  try {
    const image = await prisma.projectImage.findUnique({
      where: { id: request.params.imageId },
    });

    if (!image) {
      return response.status(404).json({ message: "Imagem não encontrada." });
    }

    await remove(image.storageKey);

    await prisma.$transaction(async (transaction) => {
      await transaction.projectImage.delete({ where: { id: image.id } });

      if (image.isCover) {
        const replacement = await transaction.projectImage.findFirst({
          where: { projectId: image.projectId },
          orderBy: { displayOrder: "asc" },
        });

        if (replacement) {
          await transaction.projectImage.update({
            where: { id: replacement.id },
            data: { isCover: true },
          });
        }
      }
    });

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function reorderProjectImages(request, response, next) {
  try {
    const imageIds = request.body?.imageIds;

    if (
      !Array.isArray(imageIds) ||
      imageIds.length === 0 ||
      new Set(imageIds).size !== imageIds.length
    ) {
      throw httpError(400, "Envie uma lista única de imageIds.");
    }

    const images = await prisma.projectImage.findMany({
      where: { projectId: request.params.projectId },
      select: { id: true },
    });

    const storedIds = new Set(images.map((image) => image.id));

    if (
      storedIds.size !== imageIds.length ||
      imageIds.some((imageId) => !storedIds.has(imageId))
    ) {
      throw httpError(400, "A ordenação deve conter exatamente as imagens do projeto.");
    }

    await prisma.$transaction(
      imageIds.map((imageId, displayOrder) =>
        prisma.projectImage.update({
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
