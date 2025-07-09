import {
	createContact,
	deleteContact,
	getAllContacts,
	getContactById,
} from "@/controllers/contact.controller";
import express from "express";

const contactRouter = express.Router();

/**
 *
 * @ POST: /api/contact
 * @desc Create a new contact message
 * access: Public
 */
contactRouter.post("/", createContact);

/**
 *
 * @ GET: /api/contact
 * @desc Get all contact messages
 * access: Admin
 */
contactRouter.get("/", getAllContacts);

/**
 *
 * @ DELETE: /api/contact/:id
 * @desc Delete a contact message by ID
 * access: Admin
 */
contactRouter.delete("/:id", deleteContact);
/**
 *
 * @ GET: /api/contact/:id
 * @desc Get a contact message by ID
 * access: Admin
 */

contactRouter.get("/:id", getContactById);
export default contactRouter;
