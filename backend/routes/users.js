import express from "express";
const router = express.Router();

import UserController from "../controllers/UserController.js";
import authToken from "../middlewares/authMiddleware.js";
import uploadProfile from "../middlewares/multerProfile.js";
import multerErrorHandler from "../middlewares/multerErrorHandler.js";

router.patch(
  "/avatar",
  authToken,
  uploadProfile.single("profile_image"),
  multerErrorHandler(2),
  UserController.updateProfileImage,
);

router.get("/", authToken, UserController.getById);
router.put("/", authToken, UserController.update);

export default router;
