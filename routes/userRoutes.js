const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
