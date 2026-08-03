import { Router } from "express";
import { MAX_IMAGES_PER_PROJECT } from "../config/constants.js";
import { imageUpload } from "../middlewares/upload.js";
import {
  addProjectImages,
  createProject,
  deleteProject,
  deleteProjectImage,
  getAdminProject,
  listAdminProjects,
  reorderProjectImages,
  updateProject,
  updateProjectImage,
  updateProjectVisibility,
} from "../controllers/projectController.js";

const adminProjectRoutes = Router();

adminProjectRoutes.get("/", listAdminProjects);
adminProjectRoutes.post("/", createProject);
adminProjectRoutes.get("/:projectId", getAdminProject);
adminProjectRoutes.patch("/:projectId", updateProject);
adminProjectRoutes.patch("/:projectId/visibility", updateProjectVisibility);
adminProjectRoutes.delete("/:projectId", deleteProject);
adminProjectRoutes.post(
  "/:projectId/images",
  imageUpload.array("images", MAX_IMAGES_PER_PROJECT),
  addProjectImages,
);
adminProjectRoutes.patch("/:projectId/images/order", reorderProjectImages);
adminProjectRoutes.patch("/images/:imageId", updateProjectImage);
adminProjectRoutes.delete("/images/:imageId", deleteProjectImage);

export default adminProjectRoutes;
