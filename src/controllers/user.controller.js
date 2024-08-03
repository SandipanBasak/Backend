import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadcloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { stringify } from "flatted";

const registerUser=asyncHandler( async (req,res)=>{
    const {username,fullName,email,password}=req.body;

    //check if the username email,password is not empty
    if(
        [fullName,email,username,password].some((field)=>
            field?.trim() === "")
        )
        throw new ApiError(400,"All fields are required")

    const existingUser= await User.findOne(
        { $or: [{ username }, { email }] }
    );

    if(existingUser)
        throw new ApiError(409,"User with email or username already exists")

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath)
        throw new ApiError(400,"Avatar file is required")

    const avatar = await uploadcloudinary(avatarLocalPath)
    const coverImage = await uploadcloudinary(coverImageLocalPath)
    

    if(!avatar)
        throw new ApiError(400,"Avatar file is required")

    const user = await User.create({
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        fullName,
        email,
        password
    })

    const createdUser = User.findById(user._id).select("-password -refreshToken")

    if(!createdUser)
        throw new ApiError(500,"Something went wrong while registering the user")

    return res.status(201).json(
        stringify(new ApiResponse(
            200,
            createdUser,
            "User registered successfully"
        )
    ))
})




export {
    registerUser
}


