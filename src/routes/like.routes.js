import { Router } from "express";
import { getLikedVidos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller";
import { verifyJWT } from "../middlewares/auth.middleware";


const router = Router()


router.route("/toggle/v/:videoId").post(verifyJWT,toggleVideoLike);
router.route("/toggle/c/:commentId").post(verifyJWT,toggleCommentLike);
router.route("/toggle/t/:tweetId").post(verifyJWT,toggleTweetLike);
router.route("/videos").get(verifyJWT,getLikedVidos);