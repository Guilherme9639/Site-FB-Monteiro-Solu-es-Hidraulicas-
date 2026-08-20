export const SESSION_COOKIE_NAME = "fb_admin_session";
export const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS ?? 8);
export const SESSION_TTL_MS = SESSION_TTL_HOURS * 60 * 60 * 1000;
export const MAX_IMAGES_PER_PROJECT = Number(
  process.env.MAX_IMAGES_PER_PROJECT ?? 20,
);
export const MAX_IMAGES_PER_WORK_CAROUSEL = Number(
  process.env.MAX_IMAGES_PER_WORK_CAROUSEL ?? 20,
);
export const MAX_IMAGE_SIZE_MB = Number(process.env.MAX_IMAGE_SIZE_MB ?? 25);
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const SITE_IMAGE_SECTIONS = Object.freeze({
  "home.hero": "home",
  "sobre.empresa": "sobre",
  "contato.banner": "contato",
});
