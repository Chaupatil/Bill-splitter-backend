const asyncHandler = require("express-async-handler");
const ExpenseGroup = require("../models/ExpenseGroup");
const calculateSettlements = require("../utils/calculateSettlements");

// @desc    Get all expense groups
// @route   GET /api/expense-groups
// @access  Public
const getExpenseGroups = asyncHandler(async (req, res) => {
  const expenseGroups = await ExpenseGroup.find().sort({ createdAt: -1 });
  res.status(200).json(expenseGroups);
});

// @desc    Create expense group
// @route   POST /api/expense-groups
// @access  Public
const createExpenseGroup = asyncHandler(async (req, res) => {
  const { name, friends, expenses } = req.body;

  if (!name || !friends || friends.length === 0) {
    res.status(400);
    throw new Error("Please provide name and at least one friend");
  }

  const expenseGroup = await ExpenseGroup.create({
    name,
    friends,
    expenses: expenses || [],
  });

  res.status(201).json(expenseGroup);
});

// @desc    Get expense group by ID
// @route   GET /api/expense-groups/:id
// @access  Public
const getExpenseGroup = asyncHandler(async (req, res) => {
  const expenseGroup = await ExpenseGroup.findById(req.params.id);

  if (!expenseGroup) {
    res.status(404);
    throw new Error("Expense group not found");
  }

  res.status(200).json(expenseGroup);
});

// @desc    Update expense group
// @route   PUT /api/expense-groups/:id
// @access  Public
const updateExpenseGroup = asyncHandler(async (req, res) => {
  const expenseGroup = await ExpenseGroup.findById(req.params.id);

  if (!expenseGroup) {
    res.status(404);
    throw new Error("Expense group not found");
  }

  const updatedExpenseGroup = await ExpenseGroup.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedExpenseGroup);
});

// @desc    Delete expense group
// @route   DELETE /api/expense-groups/:id
// @access  Public
const deleteExpenseGroup = asyncHandler(async (req, res) => {
  const expenseGroup = await ExpenseGroup.findById(req.params.id);

  if (!expenseGroup) {
    res.status(404);
    throw new Error("Expense group not found");
  }

  await expenseGroup.deleteOne();
  res.status(204).json({ id: req.params.id });
});

// @desc    Calculate settlements for an expense group
// @route   GET /api/expense-groups/:id/settlements
// @access  Public
const getGroupSettlements = asyncHandler(async (req, res) => {
  const expenseGroup = await ExpenseGroup.findById(req.params.id);

  if (!expenseGroup) {
    res.status(404);
    throw new Error("Expense group not found");
  }

  const settlements = calculateSettlements(
    expenseGroup.friends,
    expenseGroup.expenses
  );
  res.status(200).json(settlements);
});

const addExpense = asyncHandler(async (req, res) => {
  const expenseGroup = await ExpenseGroup.findById(req.params.id);

  if (!expenseGroup) {
    res.status(404);
    throw new Error("Expense group not found");
  }

  const { description, amount, paidBy, date } = req.body;

  if (!description || !amount || !paidBy) {
    res.status(400);
    throw new Error("Please provide description, amount, and paidBy");
  }

  expenseGroup.expenses.push({
    description,
    amount: parseFloat(amount),
    paidBy,
    createdAt: date || new Date(),
  });

  await expenseGroup.save();
  res.status(201).json(expenseGroup);
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expenseGroup = await ExpenseGroup.findById(req.params.id);

  if (!expenseGroup) {
    res.status(404);
    throw new Error("Expense group not found");
  }

  const expenseIndex = expenseGroup.expenses.findIndex(
    (expense) => expense._id.toString() === req.params.expenseId
  );

  if (expenseIndex === -1) {
    res.status(404);
    throw new Error("Expense not found");
  }

  expenseGroup.expenses.splice(expenseIndex, 1);
  await expenseGroup.save();

  res.status(200).json(expenseGroup);
});

module.exports = {
  getExpenseGroups,
  createExpenseGroup,
  getExpenseGroup,
  updateExpenseGroup,
  deleteExpenseGroup,
  getGroupSettlements,
  addExpense,
  deleteExpense,
};
