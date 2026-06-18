import express from "express";
import {
  Login,
  register,
  showLogin,
  showRegister,
  dashboard,
  logout,
  refreshAccessToken,
} from "../controllers/user.controllers.js";
import { verifyUser } from "../middlewares/user.middlewares.js";
const router = express.Router();

router.get("/register", showRegister);
router.get("/login", showLogin);
router.get("/dashboard", verifyUser, dashboard);
router.get("/logout", logout);

router.post("/register", register);
router.post("/login", Login);
router.post("/refresh-token", refreshAccessToken);

export default router;
