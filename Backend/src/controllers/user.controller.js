import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import getDataUri from "../utils/dataUri.js";
import { Post } from "../models/post.model.js";

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
    console.log("User created:", user);
    
    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      throw new ApiErrors(401, "Something went wrong while registring user");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User register successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(
      new ApiErrors(500,"Internal server error")
    )
  }
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password){
    throw new ApiErrors(401, "Email or Username is required");
  }

  const user = await User.findOne({ username : username.toLowerCase() });

  if (!user) {
    throw new ApiErrors(400, "User not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiErrors(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

  // populate each post if in the posts array
  const populatedPosts = await Promise.all(
    user.post.map(async (postId) => {
      const post = await Post.findById(postId);
      if (post.author.equals(user._id)) {
        return post;
      }
      return null;
    })
  );

  const loggedInUser = {
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    bio: user.bio,
    followers: user.followers,
    following: user.following,
    post: populatedPosts,
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
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  const option = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select("-password");
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

    const user = await User.findById(userId).select("-password");
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

const getSuggestedUsers = asyncHandler(async (req, res) => {
  const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
    "-password"
  );
  if (!suggestedUsers) {
    throw new ApiErrors(401, "Currently do not suggest any user");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, suggestedUsers, "Suggested users fetched"));
});

const followOrUnfollow = asyncHandler(async (req, res) => {
  try {
    console.log("User ID from token:", req.id); // Debugging line
    console.log("Params ID:", req.params.id);

    const myAccount = req.id; // My logged in account
    const otherAccount = req.params.id; // Account that i want to follow or unfollow

    if (myAccount === otherAccount) {
      throw new ApiErrors(401, "You can not follow yourself");
    }

    const user = await User.findById(myAccount);
    const targetUser = await User.findById(otherAccount);

    if (!user || !targetUser) {
      throw new ApiErrors(400, "User not found");
    }

    // check if i already follow that targetUser

    const isFollowing = user.following.includes(otherAccount);

    if (isFollowing) {
      // Unfollow logic
      await Promise.all([
        User.updateOne(
          { _id: myAccount },
          { $pull: { following: otherAccount } }
        ),
        User.updateOne(
          { _id: otherAccount },
          { $pull: { followers: myAccount } }
        ),
      ]);
      return res
        .status(200)
        .json(new ApiResponse(201, {}, "Unfollowed successfully"));
    } else {
      // Follow logic
      await Promise.all([
        User.updateOne(
          { _id: myAccount },
          { $push: { following: otherAccount } }
        ),
        User.updateOne(
          { _id: otherAccount },
          { $push: { followers: myAccount } }
        ),
      ]);
      return res
        .status(200)
        .json(new ApiResponse(201, {}, "Followed successfully"));
    }
  } catch (error) {
    console.log(error);
  }
});

const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const authorId = req.id;
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiErrors(401, "Post not found");
  }

  // Check if loggedIn user is owner of the post

  if (post.author.toString() != authorId) {
    throw new ApiErrors(401, "Unauthorized request");
  }

  // Delete post

  await Post.findByIdAndDelete(postId);

  // Remove the postId from user's post

  let user = await User.findById(authorId);
  user.post = user.post.filter((id) => id.toString() != postId);
  await user.save();

  // Delete associated comments
  await Comment.deleteMany({ post: postId });

  return res.status(200).json(new ApiResponse(201, "Post deleted"));
});

const savePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const authorId = req.id;
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiErrors(401, "Post not found");
  }
  const user = await User.findById(authorId);
  if (user.bookmarks.includes(post._id)) {
    // Unsave (remove from bookmark)
    await user.updateOne({ $pull: { bookmarks: post._id } });
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(201, "Post removed from saved"));
  } else {
    // Save (add to bookmark)
    await user.updateOne({ $addToSet: { bookmarks: post._id } });
    await user.save();

    return res.status(200).json(new ApiResponse(201, "Post saved"));
  }
});

export {
  register,
  login,
  logout,
  getProfile,
  editProfile,
  getSuggestedUsers,
  followOrUnfollow,
  deletePost,
  savePost,
};
