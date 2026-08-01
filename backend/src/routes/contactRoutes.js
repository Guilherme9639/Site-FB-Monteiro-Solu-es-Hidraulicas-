import { Router } from "express";
import {
  createContact,
  listContacts,
} from "../controllers/contactController.js";

const contactRoutes = Router();

contactRoutes.post("/", createContact);
contactRoutes.get("/", listContacts);

export default contactRoutes;