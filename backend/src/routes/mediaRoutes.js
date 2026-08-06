import { Router } from "express";
import {
  serveProjectImage,
  serveSiteImage,
} from "../controllers/mediaController.js";

const mediaRoutes = Router();

mediaRoutes.get("/projects/:imageId", serveProjectImage);
mediaRoutes.get("/site/:imageId", serveSiteImage);

export default mediaRoutes;
