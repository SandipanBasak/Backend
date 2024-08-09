import mongoose  from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";



const createTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body;
    const owner = await User.findById(req.user?._id).select("-password -refreshToken");

    if(content?.trim()==="")
        throw new ApiError(400,"Content is required")

    if(!owner)
        throw new ApiError(404,"User not found")

    const tweet = Tweet.create({
        content,
        owner : owner._id
    })

    if(!tweet)
        throw new ApiError(500,"Failed to create tweet")

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {content,owner},
        "Tweet created successfully"
    ))
})

const getUserTweets = asyncHandler(async (req, res) => {

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: req.user?._id,
            },
        },
        {
            $project: {
                content: 1,
            },
        },
    ]);

    if (!tweets)
        throw new ApiError(404, "Tweets not found");

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            tweets,
            "Tweets retrieved successfully"
        ));
});

const updateTweet = asyncHandler( async (req,res)=>{
    const {content} = req.body
    

    if(!content)
        throw new ApiError(400,"Content not filled")

    const tweet = await Tweet.findByIdAndUpdate(
        req.params.id,
        {
            $set:{content},
        },
        {
            new:true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet updated successfully"))
})

const deleteTweet = asyncHandler (async (req,res)=>{
    const tweetId = req.params.id

    if(!tweetId)
        throw new ApiError(404,"Tweet not found")

    const deletedTweet = Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200,deletedTweet,"Tweet was deleted successfully"))
})



export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}