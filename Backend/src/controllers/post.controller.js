import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import sharp from "sharp";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addNewPost = asyncHandler(async (req, res) => {
  const caption = req.body;
  const image = req.file;
  const authorId = req.id;

  if (!image) {
    throw new ApiErrors(400, "Image required");
  }

  const optimizedImageBuffer = await sharp(image.buffer)
    .resize({ width: 800, height: 800, fit: "inside" })
    .toFormat("jpeg", { quality: 80 })
    .toBuffer();

  // Buffer to data uri

  const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
  const cloudResponse = await cloudinary.uploader.upload(fileUri);

  const post = await Post.create({
    caption,
    image: cloudResponse.secure_url,
    author: authorId,
  });

  const user = await User.findById(authorId);
  if (user) {
    user.post.push(post._id);
    await user.save();
  }

  await post.populate({ path: "author", select: "-password" });

  return res.status(200).json(new ApiResponse(201, post, "New post added"));
});

const getAllPostOnFeed = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ creatrdAt: -1 })
    .populate({ path: "author", select: "username,profilePicture" })
    .populate({
      path: "comment",
      sort: { createdAt: -1 },
      populate: { path: "author", select: "username,profilePicture" },
    });

  return res.status(200).json(new ApiResponse(201, posts, "All post fetched"));
});

const getUserPost = asyncHandler(async (req, res) => {
  const authorId = req.id;
  const posts = await Post.find({ author: authorId })
    .sort({ createdAt: -1 })
    .populate({ path: "author", select: "username,profilePicture" })
    .populate(
      { path: "comment", sort: { createdAt: -1 } }.populate({
        path: "author",
        select: "username,profilePicture",
      })
    );

  return res
    .status(200)
    .json(new ApiResponse(201, posts, "All user's post fetched"));
});

const likePost = asyncHandler(async (req, res) => {
  const likingUser = req.id;
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiErrors(400, "Post not found");
  }

  // Like logic

  await post.updateOne({ $addToSet: { likes: likingUser } });
  await post.save();

  // Implement socket io for real time notification

  return res.status(200).json(new ApiResponse(201, {}, "Post liked"));
});

const disLikePost = asyncHandler(async (req, res) => {
  const dislikingUser = req.id;
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiErrors(400, "Post not found");
  }

  // Like logic

  await post.updateOne({ $pull: { likes: dislikingUser } });
  await post.save();

  // Implement socket io for real time notification

  return res.status(200).json(new ApiResponse(201, {}, "Post liked"));
});

const addComment = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const commentingUser = req.id;
  const { text } = req.body;

  const post = await Post.findById(postId);

  if (!text) {
    throw new ApiErrors(401, "Text is required");
  }

  const comment = await Comment.create({
    text,
    author: commentingUser,
    post: postId,
  }).populate({
    path: "author",
    select: "username, profilePicture",
  });

  post.comment.push(comment._id);
  await post.save();

  return res
    .status(200)
    .json(new ApiResponse(201, comment, "Comment published"));
});



export {
  addNewPost,
  getAllPostOnFeed,
  getUserPost,
  likePost,
  disLikePost,
  addComment,
};
