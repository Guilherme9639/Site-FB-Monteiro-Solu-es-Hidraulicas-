import { Router } from "express";
import { getPublicWorkCarousel } from "../controllers/workCarouselController.js";

const workCarouselRoutes = Router();

workCarouselRoutes.get("/", getPublicWorkCarousel);

export default workCarouselRoutes;
