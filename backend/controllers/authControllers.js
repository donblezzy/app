import { delete_file, upload_file } from "../Utils/cloudinary.js";
import { getResetPasswordTemplate } from "../Utils/emailTemplate.js";
import ErrorHandler from "../Utils/errorHandler.js";
import sendEmail from "../Utils/sendEmail.js";
import sendToken from "../Utils/sendToken.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/user.js";
import crypto from "crypto";

// Register USER => /api/register
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
  });

  sendToken(user, 201, res);
});

// Login USER => /api/login
export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  // Find User in the database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Check if password is correct
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

// Logout USER => /api/logout
export const logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    message: "Logged Out",
  });
});


// Upload User Avatar => /api/me/upload_avatar
export const uploadAvatar = catchAsyncError(async (req, res, next) => {
  const avatarResponse = await upload_file(req.body.avatar, "shopIT/avatars")

  // Remove Previous Avatar 
  if (req?.user?.avatar?.url) {
    await delete_file(req?.user?.avatar?.public_id)
  }
  const user = await User.findByIdAndUpdate(req?.user?._id, {
    avatar: avatarResponse,
  })

  res.status(200).json({
    user,
  });
});
// FORGOT PASSWORD => /api/password/forgot
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  // Find User in the database
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // GET RESET PASSWORD TOKEN
  const resetToken = user.getResetPasswordToken();

  await user.save();

  // CREATE RESET PASSWORD URL
   // Backend
  // const resetUrl = `${process.env.FRONTEND_URL}/api/password/reset/${resetToken}`;
   // frontend 
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = getResetPasswordTemplate(user?.name, resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "ShopIT password Recovery",
      message,
    });

    res.status(200).json({
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return next(new ErrorHandler(error?.message, 500));
  }
});

// RESET PASSWORD => /api/password/reset/:token
export const resetPassword = catchAsyncError(async (req, res, next) => {
  //Hash the URL token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
    
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler("Password reset token is invalid or has expired", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  //SET THE NEW PASSWORD
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save()

  sendToken(user, 200, res)
});

//GET CURRENT USER PROFILE => /api/me
export const getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req?.user?._id)

  res.status(200).json({
    user
  })
})

//UPDATE PASSWORD => /api/password/update
export const updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req?.user?._id).select("+password")

  //Check the previous password
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

  if(!isPasswordMatched) {
    return next(new ErrorHandler(`Old Password is incorrect`, 400))
  }

  user.password = req.body.newPassword
  user.save()

  res.status(200).json({
    success: "Password change successfully"
  })
})

//UPDATE USER PROFILE => /api/me/update
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email
  }

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, { new: true })

  res.status(200).json({
    user
  })
})


//GET ALL USERS(ADMIN) => /api/admin/users
export const allUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find()

  res.status(200).json({
    users
  })
})

//GET ALL USER DETAILS(ADMIN) => /api/admin/users/:id
export const getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if(!user) {
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404))
  }

  res.status(200).json({
    user
  })
})


//UPDATE USER Details(ADMIN) => /api/admin/users/:id
export const updateUser = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  }

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, { new: true })

  res.status(200).json({
    user
  })
})

//DELETE USER(ADMIN) => /api/admin/users/:id
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if(!user) {
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404))
  }

  //TODO  - REMOVE USER AVATAR FROM CLOUDINARY
  if (user?.avatar?.public_id) {
    await delete_file(user?.avatar?.public_id)
  }

  await user.deleteOne()

  res.status(200).json({
    success: "User deleted Successfully"
  })
})
