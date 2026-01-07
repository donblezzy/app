import jwt from "jsonwebtoken";
import ErrorHandler from "../Utils/errorHandler.js";
import catchAsyncError from "./catchAsyncError.js";
import User from "../models/user.js"


// CHECK IF USER IS AUTHENTICATED OR NOT
export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies

    if(!token) {
        return next(new ErrorHandler("Login first to access this resource", 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)

    next()
})


// AUTHORIZE USER ROLES
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403))
        }

        next()
    }
}

