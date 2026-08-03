import { prisma } from "../lib/prisma.js";
import { getPath } from "../services/storage/localStorage.js";

export async function serveProjectImage(request, response, next) {
  try {
    const image = await prisma.projectImage.findUnique({
      where: { id: request.params.imageId },
      include: { project: true },
    });

    if (!image || (!request.user && (!image.isVisible || !image.project.isVisible))) {
      return response.status(404).json({ message: "Imagem não encontrada." });
    }

    return response.sendFile(getPath(image.storageKey));
  } catch (error) {
    return next(error);
  }
}

export async function serveSiteImage(request, response, next) {
  try {
    const image = await prisma.siteImage.findUnique({
      where: { id: request.params.imageId },
    });

    if (!image || (!request.user && !image.isVisible)) {
      return response.status(404).json({ message: "Imagem não encontrada." });
    }

    return response.sendFile(getPath(image.storageKey));
  } catch (error) {
    return next(error);
  }
}
