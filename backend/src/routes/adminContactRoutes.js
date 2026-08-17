import { Router } from "express";
import {
  listAdminContacts,
  updateContactStatus,
} from "../controllers/contactController.js";

const adminContactRoutes = Router();

adminContactRoutes.get("/", listAdminContacts);
adminContactRoutes.patch("/:contactId/status", updateContactStatus);

export default adminContactRoutes;
