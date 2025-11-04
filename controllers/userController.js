const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });

  return token;
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, currentPassword, newPassword, avatar } = req.body;

  // If updating password, verify current password
  if (newPassword) {
    if (!currentPassword) {
      res.status(400);
      throw new Error("Please provide current password");
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
  }

  // Update other fields if provided
  if (name) user.name = name;
  if (email) {
    // Check if email is already taken by another user
    const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
    user.email = email;
  }
  if (avatar) user.avatar = avatar;

  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
  });
});

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  getProfile,
};
