import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse";

const getVideoComments = asyncHandler(async(req,res)=>{
    
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId)
        throw new ApiError(400,"Video does not exist")

    const comment = await  Comment.aggregate(
        [
            {
                $match: {
                    videos : videoId
                }
            },
        ]
    )

    return res
    .status(200)
    .json(new ApiResponse(200,comment,"Comments of the video is fetched successfully"))
})


const addComment = asyncHandler(async (req,res)=>{

    const {content} = req.body
    const {owner} = req.user?._id
    const {videos} = req.params

    if(!content)
        throw new ApiError(400,"Comment does not exist")

    if(!owner)
        throw new ApiError(400,"User does not exist")

    if(!videos)
        throw new ApiError(404,"Video does not exist")

    const comment = await Comment.create({
        content,
        owner,
        videos
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        comment,
        "Comment created successfully",
    ))

})

const updateComment = asyncHandler(async(req,res)=>{
    
    const id = req.params
    const {content} = req.body

    if(!id)
        throw new ApiError(400,"Comment does not exist")

    const comment = await Comment.findByIdAndUpdate(id,
        {
            content
        },
        {
            new:true,
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200,comment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async(req,res)=>{
    const id = req.params

    if(!id)
        throw new ApiError(400,"Comment does not exist")

    const deletedComment = await Comment.findByIdAndDelete(id)

    return res
    .status(200)
    .json(new ApiResponse(200,deletedComment,"Comment deleted successfully"))
    
})


export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
}