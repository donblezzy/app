import express from "express"
import { authorizeRoles, isAuthenticated } from "../middlewares/protect.js"
import { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, 
    getUserProfile, updatePassword, updateProfile, allUsers, 
    getUserDetails,
    updateUser,
    deleteUser,
    uploadAvatar} from "../controllers/authControllers.js"

const router = express.Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(logoutUser)

router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)

router.route("/me").get(isAuthenticated, getUserProfile)
router.route("/me/update").put(isAuthenticated, updateProfile)
router.route("/password/update").put(isAuthenticated, updatePassword)
router.route("/me/upload_avatar").put(isAuthenticated, uploadAvatar)

router.route("/admin/users").get(isAuthenticated, authorizeRoles("admin"), allUsers)
// router.route("/admin/users/:id").get(isAuthenticated, authorizeRoles("admin"), getUserDetails)
// router.route("/admin/users/:id").put(isAuthenticated, authorizeRoles("admin"), updateUser)
// router.route("/admin/users/:id").delete(isAuthenticated, authorizeRoles("admin"), deleteUser)

// OR

router.route("/admin/users/:id")
.get(isAuthenticated, authorizeRoles("admin"), getUserDetails)
.put(isAuthenticated, authorizeRoles("admin"), updateUser)
.delete(isAuthenticated, authorizeRoles("admin"), deleteUser)

export default router