import { Router } from "express";
import {
  serveProjectImage,
  serveSiteImage,
} from "../controllers/mediaController.js";
import { serveWorkCarouselImage } from "../controllers/workCarouselController.js";

const mediaRoutes = Router();

mediaRoutes.get("/projects/:imageId", serveProjectImage);
mediaRoutes.get("/site/:imageId", serveSiteImage);
mediaRoutes.get("/work-carousel/:imageId", serveWorkCarouselImage);

export default mediaRoutes;
