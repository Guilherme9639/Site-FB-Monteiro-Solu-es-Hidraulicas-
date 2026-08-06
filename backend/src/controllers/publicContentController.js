import { prisma } from "../lib/prisma.js";
import { mapProject, mapSiteImage } from "../utils/responseMappers.js";

const visibleProjectInclude = {
  images: {
    where: { isVisible: true },
    orderBy: { displayOrder: "asc" },
  },
};

export async function listPublicProjects(request, response, next) {
  try {
    const projects = await prisma.project.findMany({
      where: { isVisible: true },
      include: visibleProjectInclude,
      orderBy: { createdAt: "desc" },
    });

    return response.status(200).json({
      projects: projects.map((project) => mapProject(project)),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicProject(request, response, next) {
  try {
    const project = await prisma.project.findFirst({
      where: {
        slug: request.params.slug,
        isVisible: true,
      },
      include: visibleProjectInclude,
    });

    if (!project) {
      return response.status(404).json({ message: "Projeto não encontrado." });
    }

    return response.status(200).json({ project: mapProject(project) });
  } catch (error) {
    return next(error);
  }
}

export async function listPublicSiteImages(request, response, next) {
  try {
    const images = await prisma.siteImage.findMany({
      where: { isVisible: true },
      orderBy: { key: "asc" },
    });

    return response.status(200).json({
      images: images.map((image) => mapSiteImage(image)),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicSiteImage(request, response, next) {
  try {
    const image = await prisma.siteImage.findFirst({
      where: {
        key: request.params.key,
        isVisible: true,
      },
    });

    if (!image) {
      return response.status(404).json({ message: "Imagem não encontrada." });
    }

    return response.status(200).json({ image: mapSiteImage(image) });
  } catch (error) {
    return next(error);
  }
}
