const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
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

module.exports = { registerUser, loginUser };
