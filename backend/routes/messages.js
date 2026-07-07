import express from "express";
const router = express.Router();

import MessageController from "../controllers/MessageController.js";
import authToken from "../middlewares/authMiddleware.js";
import uploadMessageAttachment from "../middlewares/multerMessageAttachment.js";
import multerErrorHandler from "../middlewares/multerErrorHandler.js";

router.use(authToken);

router.get("/unread-count", MessageController.getUnreadCount);
router.get(
  "/conversation/:conversation_id",
  MessageController.getByConversationId,
);
router.get("/:id", MessageController.getById);

router.post(
  "/conversation/:conversation_id",
  uploadMessageAttachment.array("attachments", 5),
  multerErrorHandler(10),
  MessageController.create,
);

router.delete("/attachments/:id", MessageController.deleteAttachment);
router.delete("/:id", MessageController.delete);

export default router;
