import { Router } from "express";
import {
  getPublicProject,
  getPublicSiteImage,
  listPublicProjects,
  listPublicSiteImages,
} from "../controllers/publicContentController.js";

const publicContentRoutes = Router();

publicContentRoutes.get("/projects", listPublicProjects);
publicContentRoutes.get("/projects/:slug", getPublicProject);
publicContentRoutes.get("/site-images", listPublicSiteImages);
publicContentRoutes.get("/site-images/:key", getPublicSiteImage);

export default publicContentRoutes;
