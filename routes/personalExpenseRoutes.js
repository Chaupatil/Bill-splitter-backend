const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { protect } = require("../middleware/auth");
const personalExpenseController = require("../controllers/personalExpenseController");

// @route   GET /api/personal-expenses
// @desc    Get all personal expenses for the protectenticated user
// @access  Private
router.get("/", protect, personalExpenseController.getPersonalExpenses);

// @route   POST /api/personal-expenses
// @desc    Add a new personal expense
// @access  Private
router.post(
  "/",
  [
    protect,
    [
      check("amount", "Amount is required and must be a number").isNumeric(),
      check("type", "Type must be either credit or debit").isIn([
        "credit",
        "debit",
      ]),
      check("category", "Category is required").notEmpty(),
    ],
  ],
  personalExpenseController.addPersonalExpense
);

// @route   GET /api/personal-expenses/:id
// @desc    Get a single personal expense
// @access  Private
router.get("/:id", protect, personalExpenseController.getPersonalExpenseById);

// @route   PUT /api/personal-expenses/:id
// @desc    Update a personal expense
// @access  Private
router.put(
  "/:id",
  [
    protect,
    [
      check("amount", "Amount must be a number").optional().isNumeric(),
      check("type", "Type must be either credit or debit")
        .optional()
        .isIn(["credit", "debit"]),
    ],
  ],
  personalExpenseController.updatePersonalExpense
);

// @route   DELETE /api/personal-expenses/:id
// @desc    Delete a personal expense
// @access  Private
router.delete("/:id", protect, personalExpenseController.deletePersonalExpense);

// @route   GET /api/personal-expenses/stats
// @desc    Get expense statistics
// @access  Private
router.get(
  "/stats/summary",
  protect,
  personalExpenseController.getExpenseStats
);

module.exports = router;
