import express from "express";
import {
  getAllAnimes,
  getAnimeById,
  getAnimeOnAir,
  getBestAnimes,
  getRandomAnime,
} from "../controllers/animesController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkTrial } from "../middlewares/checkTrial.js";
import { getAnimeLink, getStreamProxy } from "../middlewares/getAnimeLink.js";

const router = express.Router();

//public
router.get("/getAnimes", getAllAnimes);
router.get("/getAnime/:animeTitle", getAnimeById);
router.get("/onAir", getAnimeOnAir);
router.get("/topRating", getBestAnimes);
router.get("/random", getRandomAnime);
router.get("/stream/:title/:episodes", getAnimeLink);
router.get("/stream-proxy/:token", getStreamProxy);

export default router;
