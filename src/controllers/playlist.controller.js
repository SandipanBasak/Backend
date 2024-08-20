import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createPlayList = asyncHandler(async(req,res)=>{
    const {name,description}=req.body;

    if(!name || !description)
        throw new ApiError(400,"Please provide name and description");

    const playlist = await Playlist.create(
        {
            name,
            description,
            owner : mongoose.Types.ObjectId(req.user._id)
        });

    return res 
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist created successfully"));

})

const getUserPlaylists = asyncHandler(async(req,res)=>{
    const {userId} = req.params
    
    if(!userId)
        throw new ApiError(400,"User not found");

    const playlists = await Playlist.find({owner : userId});

    if(!playlists)
        throw new ApiError(400,"No playlist to show")

    return res 
    .status(200)
    .json(new ApiResponse(200,playlists,"User playlists"));

})

const getPlayListById = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params

    const playlist = await Playlist.findById(playlistId)
    if(!playlist)
        throw new ApiError(400,"Playlist not found");

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist found"))
})

const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params

    if(!playlistId)
        throw new ApiError(400,"Playlist not found");

    if(!videoId)
        throw new ApiError(400,"Video not found");

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                videos: [...req.body.videos,videoId],
            }  
        },
        {
            new:true
        }
    )

    return res 
    .status(200)
    .json(new ApiResponse(200,playlist,"Video added to the playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params

    if(!playlistId)
        throw new ApiError(400,"Playlist not found");

    if(!videoId)
        throw new ApiError(400,"Video not found");

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos : videoId
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"video is deleted"))
})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId}=req.params

    if(!playlistId)
        throw new ApiError(400,"Playlist not found")

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist deleted"))
})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!name || !description)
        throw new ApiError(400,"Please provide name and description");

    if(!playlistId)
        throw new ApiError(400,"Playlist not found")

    const playlist = Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set :{
                name,
                description
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist Updated"))

})


export {
    createPlayList,
    getUserPlaylists,
    getPlayListById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}