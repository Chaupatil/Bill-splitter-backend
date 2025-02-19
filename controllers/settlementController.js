const asyncHandler = require("express-async-handler");
const Settlement = require("../models/Settlement");
const ExpenseGroup = require("../models/ExpenseGroup");
const calculateSettlements = require("../utils/calculateSettlements");

// @desc    Create settlements for a group
// @route   POST /api/expense-groups/:id/settlements
// @access  Public
const createSettlements = asyncHandler(async (req, res) => {
  const expenseGroup = await ExpenseGroup.findById(req.params.id);

  if (!expenseGroup) {
    res.status(404);
    throw new Error("Expense group not found");
  }

  // Calculate settlements
  const calculatedSettlements = calculateSettlements(
    expenseGroup.friends,
    expenseGroup.expenses
  );

  // Create settlement records
  const settlements = await Promise.all(
    calculatedSettlements.map(async (settlement) => {
      // Check if there's already a pending settlement between these users
      const existingSettlement = await Settlement.findOne({
        expenseGroupId: expenseGroup._id,
        from: settlement.from,
        to: settlement.to,
        status: "PENDING",
      });

      if (existingSettlement) {
        // Update existing settlement
        existingSettlement.amount = settlement.amount;
        return existingSettlement.save();
      } else {
        // Create new settlement
        return Settlement.create({
          expenseGroupId: expenseGroup._id,
          ...settlement,
        });
      }
    })
  );

  res.status(201).json(settlements);
});

// @desc    Get all settlements for a group
// @route   GET /api/expense-groups/:id/settlements
// @access  Public
const getSettlements = asyncHandler(async (req, res) => {
  const settlements = await Settlement.find({
    expenseGroupId: req.params.id,
  }).sort({ createdAt: -1 });

  res.status(200).json(settlements);
});

// @desc    Mark settlement as completed
// @route   PUT /api/expense-groups/:groupId/settlements/:settlementId
// @access  Public
const completeSettlement = asyncHandler(async (req, res) => {
  const settlement = await Settlement.findOne({
    _id: req.params.settlementId,
    expenseGroupId: req.params.groupId,
  });

  if (!settlement) {
    res.status(404);
    throw new Error("Settlement not found");
  }

  settlement.status = "COMPLETED";
  settlement.settledAt = new Date();
  await settlement.save();

  res.status(200).json(settlement);
});

module.exports = {
  createSettlements,
  getSettlements,
  completeSettlement,
};
