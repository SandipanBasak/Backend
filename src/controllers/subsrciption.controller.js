import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";




const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    const {userId} = req.user?._id

    const channel = await Subscription.findById(channelId)
    if(!channel)
        throw new ApiError(404,"Channel not found")
    
    const subscriber = await Subscription.findOne(
        {
            channel : channelId,
            subscriber : userId
        }
    )
    if(subscriber)
        await subscriber.remove()
    else
    await Subscription.create({channel:channelId,subscriber:userId})

    return res
    .status(200)
    .json(new ApiError(200,subscriber,"Toggle of Subscription"))

})

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params

    const subscriber = await Subscription.aggregate([
        {
            $match:{
                channel:channelId
            }
        },
        {
            $project:{
                subscriber:1,
            }
        }
    ])

    if(!subscriber)
        throw new ApiError(400,"No subscribers")

    return res
    .status(200)
    .json(new ApiResponse(200,subscriber,"Subscribers fetched successfully"))

})

const subscribedChannels = asyncHandler(async(req,rs)=>{
    const {subscriberId} = req.params

    if(!subscriberId)
        throw new ApiError(404,"Subscriber not found")

    const channels = await Subscription.find({
        subscriber:subscriberId
    })

    if(!channels)
        throw new ApiError(400,"No channel subscribed")

    return res
    .status(200)
    .json(new ApiResponse(200,channels,"Channels subscribed fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    subscribedChannels
}