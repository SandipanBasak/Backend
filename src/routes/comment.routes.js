import { Router } from "express";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller";
import { verifyJWT } from "../middlewares/auth.middleware";



const router = Router()

router.route("/:videoId")
.get(verifyJWT,getVideoComments)
.post(verifyJWT,addComment);

router.route("/c/:commentId")
.delete(verifyJWT,deleteComment)
.patch(verifyJWT,updateComment);