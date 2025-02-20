const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Token Verification Failed:", {
        errorType: error.name,
        errorMessage: error.message,
        tokenFragment: token ? token.substring(0, 20) + "..." : null,
        secretExists: !!process.env.JWT_SECRET,
        secretLength: process.env.JWT_SECRET?.length,
      });

      return res.status(401).json({
        message: "Authentication failed",
        error: error.message,
      });
    }
  } else {
    return res.status(401).json({ message: "No authorization header found" });
  }
});

exports.protect = protect;
