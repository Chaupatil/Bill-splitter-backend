const mongoose = require("mongoose");
const { Schema } = mongoose; // Add this line to define Schema

const expenseSchema = new Schema({
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  amount: {
    type: Number,
    required: [true, "Please add an amount"],
  },
  paidBy: {
    type: String,
    required: [true, "Please specify who paid"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  splitType: {
    type: String,
    enum: ["equal", "exact", "percentage", "adjust"],
    default: "equal",
  },
  splitDetails: {
    type: Map,
    of: new Schema(
      {
        amount: Number,
        percentage: Number,
        adjustment: Number,
      },
      { _id: false }
    ),
  },
});

const expenseGroupSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please add a group name"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      email: String,
      status: {
        type: String,
        enum: ["PENDING", "ACCEPTED"],
        default: "PENDING",
      },
    },
  ],
  friends: [
    {
      type: String,
      required: [true, "Please add at least one friend"],
    },
  ],
  expenses: [expenseSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ExpenseGroup", expenseGroupSchema);
