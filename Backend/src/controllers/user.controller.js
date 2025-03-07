import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import getDataUri from "../utils/dataUri.js";

const generateAccessTokenAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(500, "Something went wrong while generating Token");
  }
};

const register = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new ApiErrors(401, "Something is missing");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      throw new ApiErrors(400, "Email already in used");
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email,
      password,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      throw new ApiErrors(401, "Something went wrong while registring user");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User register successfully"));
  } catch (error) {
    console.log(error);
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!(username || email)) {
    throw new ApiErrors(401, "Email or Username is required");
  }

  const user = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (!user) {
    throw new ApiErrors(400, "User not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiErrors(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = {
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    bio: user.bio,
    followers: user.followers,
    following: user.following,
    posts: populatedPosts,
  };

  const option = {
    httpOnly: true,
    secure: true,
    samSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(new ApiResponse(200, loggedInUser, "User loggedIn Successfully"));
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const option = {
    httpOnly: true,
    secure: true,
    maxAge: 0,
  };

  res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Profile fetched successfully"));
});

const editProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user;
    const { bio, gender } = req.body;
    const profilePicture = req.file;

    let cloudresponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudresponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiErrors(401, "User not found");
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudresponse.secure_url;

    await user.save();

    return res.status(200).json(new ApiResponse(201, user, "Profile updated"));
  } catch (error) {
    console.log(error);
  }
});



export { register, login, logout, getProfile, editProfile };
