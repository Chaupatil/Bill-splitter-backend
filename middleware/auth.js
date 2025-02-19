const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];

//       if (!token) {
//         res.status(401).json({ message: "No token provided" });
//         return;
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token
//       console.log(decoded);

//       req.user = await User.findById(decoded.id).select("-password"); // Find the user
//       console.log(req.user);

//       if (!req.user) {
//         res.status(401).json({ message: "User not found" });
//         return;
//       }

//       next(); // Continue to the next middleware or route handler
//     } catch (error) {
//       res.status(401).json({ message: "Token is not valid" });
//     }
//   } else {
//     res.status(401).json({ message: "No token, authorization denied" });
//   }
// });

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
