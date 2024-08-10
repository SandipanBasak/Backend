import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler";
import { Like } from "../models/like.model";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";



const toggleVideoLike = asyncHandler(async (req,res)=>{
    const {videoId} = req.params
    const {likedBy} = req.user?._id

    if(!videoId)
        throw new ApiError(400,"Video not found")

    const like = await Like.aggregate([
        {
            $match: {
                video : videoId,
                likedBy,
            }
        },
    ])

    if(!like)
        throw new ApiError(400,"Something went wrong while toggling of likes in videos")

    like.likedBy = !like.likedBy
    await like.save({validateBeforeSave : false})
    

    return res 
    .status(200)
    .json(new ApiResponse(200,like,"Toggle like added successfully"))
})

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params
    const {likedBy} = req.user?._id

    if(!tweetId)
        throw new ApiError(400,"Tweet does not exist")

    const like = await Like.aggregate([
        {
            $match: {
                tweet : tweetId,
                likedBy,
            }
        },
    ])

    if(!like)
        throw new ApiError(400,"Something went wrong while toggling of likes in tweets")

    like.likedBy = !like.likedBy
    await like.save({validateBeforeSave : false})

    return res 
    .status(200)
    .json(new ApiResponse(200,like,"Toggle like added successfully"))
    
})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const {likedBy} = req.user?._id

    if(!commentId)
        throw new ApiError(400,"Tweet does not exist")

    const like = await Like.aggregate([
        {
            $match: {
                comment : commentId,
                likedBy,
            }
        },
    ])

    if(!like)
        throw new ApiError(400,"Something went wrong while toggling of likes in comments")

    like.likedBy = !like.likedBy
    await like.save({validateBeforeSave : false})

    return res 
    .status(200)
    .json(new ApiResponse(200,like,"Toggle like added successfully"))
    
})

const getLikedVidos = asyncHandler(async(req,res)=>{
    const {userId} = req.body?._id

    if(!userId)
        throw new ApiError(400,"User does not exist")

    const likedVideos = Like.aggregate([
        {
            $match : {
            likedBy : userId,
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,likedVideos,"Liked videos fetched SuccessFully"))
})



export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVidos

}