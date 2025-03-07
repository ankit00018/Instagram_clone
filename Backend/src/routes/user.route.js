import express from "express"
import { editProfile, followOrUnfollow, getProfile, getSuggestedUsers, login, logout, register } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import upload from "../middlewares/multer.middleware.js"

const router = express.Router() 

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").get(verifyJWT,logout)
router.route("/:id/profile").get(verifyJWT,getProfile)
router.route("/profile/edit").post(verifyJWT,upload.single('profilePicture'),editProfile)
router.route("/suggested").get(verifyJWT,getSuggestedUsers)
router.route("/followOrUnfollow/:id").post(verifyJWT,followOrUnfollow)

export default router








