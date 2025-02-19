const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema({
  expenseGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExpenseGroup",
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED"],
    default: "PENDING",
  },
  settledAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Settlement", settlementSchema);
