import express from "express";
import { checkHardwareStatus } from "../controllers/hardwareController.js";

const router = express.Router();
router.get("/status", checkHardwareStatus);

export default router;
