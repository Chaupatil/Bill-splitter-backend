const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
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
});

const expenseGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a group name"],
  },
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
