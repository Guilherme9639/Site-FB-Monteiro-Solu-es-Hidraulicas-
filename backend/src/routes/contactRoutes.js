import { Router } from "express";
import { createContact } from "../controllers/contactController.js";

const contactRoutes = Router();

contactRoutes.post("/", createContact);

export default contactRoutes;
