const asyncHandler=(requestHandler)=> {
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=> next(err))
    }
}


export {asyncHandler}

// const asyncHandler=(fn)=> async (res,req,next)=>{
//     try{
//         await fn(res,req,next)

//     }catch(error){
//         next(error)
//         res.status(error.code || 500).json({
//             success:false,
//             message: error.message
//         })
//     }
// }