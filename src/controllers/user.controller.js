import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadcloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { stringify } from "flatted";


const generateAccessAndRefreshTokens= async (userid)=>{
    try{
        const user = await User.findById(userid)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access tokens")

    }
}

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

const loginUser=asyncHandler( async (req,res) => {
    const {username,email,password}=req.body

    if(!username || !email)
        throw new ApiError(400,"username or email is required")

    const user= await User.findOne({
        $or:[{username},{email}]
    })

    if(!user)
        throw new ApiError(404,"user does not exist")

    const isPasswordValid = await user.comparePassword(password)

    if(!isPasswordValid)
        throw new ApiError(401,"Invalid user credentials")

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly: true,
        secure: true
    }

    return res.
    status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {user: loggedInUser, accessToken,refreshToken},
            "User logged in successfully"
        )
    )
    
})

const logoutUser= asyncHandler( async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
})

export {
    registerUser, 
    loginUser,
    logoutUser
}


