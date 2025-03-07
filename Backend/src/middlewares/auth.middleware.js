import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { ApiErrors } from "../utils/ApiErrors.js";

export const verifyJWT = asyncHandler ( async (req,res,next) => {
    try {
        let token = req.cookies?.accessToken 

         // If no token in cookies, check Authorization header
        //  if (!token && req.headers.authorization?.startsWith("Bearer")) {
        //     token = req.headers.authorization.split(" ")[1];
        // }

        if (!token) {
            throw new ApiErrors(400,"Unauthorized request")
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiErrors(401,"Invalid access token")
        }

        req.user = user
        next()
    } catch (error) {
        console.log(error);
    }
})