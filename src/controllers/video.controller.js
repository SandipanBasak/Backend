import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError";
import { uploadcloudinary } from "../utils/cloudinary.js";



const getAllVideos = asyncHandler(async (req,res)=>{
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    if(!userId)
        throw new ApiError(400, "User not found")
    const videos = Video.aggregate([
        {
            $match:{
                owner : userId
            }
        },
        {
            $sort:{
                sortBy : sortType
            }
        },
        {
            $project:{
                thumbnail : 1,
                owner : 1,
                title : 1,
                duration : 1,
                views : 1 
            }
        }
    ])

    return res 
    .status(200)
    .json(new ApiResponse(200,videos,"All videos fetched successfully"))
})

const publishAVideo = asyncHandler( async(req,res)=>{
    const { title, description} = req.body

    if(!title || !description )
        throw new ApiError(400,"Title or description needs to be filled")

    const videoLocalPath = req.files?.video[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoLocalPath)
        throw new ApiError(400,"Video is missing")

    if(!thumbnailLocalPath)
        throw new ApiError(400,"Thumbnail is missing")

    const videoPath = await uploadcloudinary(videoLocalPath)
    const thumbnailPath = await uploadcloudinary(thumbnailLocalPath)


    if(!videoPath.url)
        throw new ApiError(400, "Error while uploading video on cloudinary")

    if(!thumbnailPath.url)
        throw new ApiError(400, "Error while uploading video on cloudinary")

    const video = await Video.create(
        {
            title,
            description,
            owner : req.user?._id,
            videoFile : videoPath.url,
            thumbnail: thumbnailPath.url
        }
    ) 

    return res
    .staus(200)
    .json(new ApiResponse(200,video,"Video is published"))
})

const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!videoId)
        throw new ApiError(400, "Video not found")

    const video = await Video.findById(videoId);

    if(!video)
        throw new ApiError(404, "Video not found")


    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video is fetched"))
})

const updateVideo = asyncHandler(async (req,res)=>{
    const { videoId } = req.params
    const {title,description} = req.body
    const thumbnailLocalPath = req.file?.path

    if(!title  || !description)
        throw new ApiError(400, "Need to fill all the fields")

    if(!videoId)
        throw new ApiError(400,"Video not found")

    if(!thumbnailLocalPath)
        throw new ApiError(400,"Thumbnail is missing")

    const thumbnailPath = await uploadcloudinary(thumbnailLocalPath)

    if(!thumbnailPath.url)
        throw new ApiError(400, "Error while uploading video on cloudinary")

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail: thumbnailPath.url
            }
        },
        {
            new:true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Fields are updated"))
    
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!videoId)
        throw new ApiError(400,"Video not found")

    const video = await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video is deleted"))
})

const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!videoId)
        throw new ApiError(400,"Video not found")

    const video = await Video.findById(videoId)

    video.isPublished = !video.isPublished
    await video.save({validateBeforeSave:false})

    return res 
    .status
    .json(new ApiResponse(200,video.isPublished,"Toggling of publish status completed"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}