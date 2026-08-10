import { Router } from "express";
import { MAX_IMAGES_PER_WORK_CAROUSEL } from "../config/constants.js";
import { imageUpload } from "../middlewares/upload.js";
import {
  addWorkCarouselImages,
  deleteWorkCarouselImage,
  getAdminWorkCarousel,
  reorderWorkCarouselImages,
  updateAdminWorkCarousel,
  updateWorkCarouselImage,
} from "../controllers/workCarouselController.js";

const adminWorkCarouselRoutes = Router();

adminWorkCarouselRoutes.get("/", getAdminWorkCarousel);
adminWorkCarouselRoutes.patch("/", updateAdminWorkCarousel);
adminWorkCarouselRoutes.post(
  "/images",
  imageUpload.array("images", MAX_IMAGES_PER_WORK_CAROUSEL),
  addWorkCarouselImages,
);
adminWorkCarouselRoutes.patch("/images/order", reorderWorkCarouselImages);
adminWorkCarouselRoutes.patch("/images/:imageId", updateWorkCarouselImage);
adminWorkCarouselRoutes.delete("/images/:imageId", deleteWorkCarouselImage);

export default adminWorkCarouselRoutes;
