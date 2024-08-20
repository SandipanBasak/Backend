import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getUserChannelSubscribers, subscribedChannels, toggleSubscription } from "../controllers/subsrciption.controller.js";


const router = Router()


router.use(verifyJWT)

router
    .route("/c/:channelId")
    .get(subscribedChannels)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router