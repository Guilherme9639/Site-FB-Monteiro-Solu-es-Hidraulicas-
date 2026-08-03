import { Router } from "express";
import { imageUpload } from "../middlewares/upload.js";
import {
  deleteSiteImage,
  listAdminSiteImages,
  updateSiteImage,
  upsertSiteImage,
} from "../controllers/siteImageController.js";

const adminSiteImageRoutes = Router();

adminSiteImageRoutes.get("/", listAdminSiteImages);
adminSiteImageRoutes.put("/:key", imageUpload.single("image"), upsertSiteImage);
adminSiteImageRoutes.patch("/:imageId", updateSiteImage);
adminSiteImageRoutes.delete("/:imageId", deleteSiteImage);

export default adminSiteImageRoutes;
