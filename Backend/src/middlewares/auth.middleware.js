import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiErrors } from "../utils/ApiErrors.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  
    console.log("Cookies received in request:", req.cookies);
    console.log("Authorization header:", req.headers.authorization);

    let token;

    // Try to get the token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Try to get the token from cookies
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    console.log("Extracted Token:", token); // Log the extracted token

    if (!token) {
      throw new ApiErrors(400, "Unauthorized request");
    }

    try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log("Decoded Token:", decodedToken); // Log decoded token

    const user = await User.findById(
      decodedToken._id
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiErrors(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiErrors(401, error?.message || "Invalid access token");
  }
});
