function imageUrl(image, type) {
  return `/api/media/${type}/${image.id}`;
}

export function mapProjectImage(image, options = {}) {
  const result = {
    id: image.id,
    url: imageUrl(image, "projects"),
    description: image.description,
    displayOrder: image.displayOrder,
    isVisible: image.isVisible,
    isCover: image.isCover,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
  };

  if (options.admin) {
    result.originalName = image.originalName;
    result.mimeType = image.mimeType;
    result.size = image.size;
  }

  return result;
}

export function mapProject(project, options = {}) {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    isVisible: project.isVisible,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    images: (project.images ?? []).map((image) =>
      mapProjectImage(image, options),
    ),
  };
}

export function mapSiteImage(image, options = {}) {
  const result = {
    id: image.id,
    key: image.key,
    section: image.section,
    url: imageUrl(image, "site"),
    description: image.description,
    isVisible: image.isVisible,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
  };

  if (options.admin) {
    result.originalName = image.originalName;
    result.mimeType = image.mimeType;
    result.size = image.size;
  }

  return result;
}
