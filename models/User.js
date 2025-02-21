// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: [true, "Please add an email"],
//     unique: true,
//     lowercase: true,
//   },
//   password: {
//     type: String,
//     required: [true, "Please add a password"],
//     minlength: 6,
//     select: false,
//   },
//   name: {
//     type: String,
//     required: [true, "Please add a name"],
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// // Compare password method
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  avatar: {
    type: String,
    default: "", // Default avatar URL or empty string
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now,
  },
});

// Existing password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  if (this.isModified("password")) {
    this.lastPasswordChange = Date.now();
  }
});

// Existing password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
