// const express = require("express");
// const router = express.Router();
// const {
//   createSettlements,
//   getSettlements,
//   completeSettlement,
// } = require("../controllers/settlementController");
// const {
//   getExpenseGroups,
//   createExpenseGroup,
//   getExpenseGroup,
//   updateExpenseGroup,
//   deleteExpenseGroup,
//   getGroupSettlements,
//   addExpense,
//   deleteExpense,
// } = require("../controllers/expenseGroupController");

// router.route("/").get(getExpenseGroups).post(createExpenseGroup);

// router.route("/:id/settlements").get(getSettlements).post(createSettlements);

// router.route("/:groupId/settlements/:settlementId").put(completeSettlement);

// router
//   .route("/:id")
//   .get(getExpenseGroup)
//   .put(updateExpenseGroup)
//   .delete(deleteExpenseGroup);

// // New routes for expense management
// router.route("/:id/expenses").post(addExpense);
// router.route("/:id/expenses/:expenseId").delete(deleteExpense);

// router.get("/:id/settlements", getGroupSettlements);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createSettlements,
  getSettlements,
  completeSettlement,
} = require("../controllers/settlementController");
const {
  getExpenseGroups,
  createExpenseGroup,
  getExpenseGroup,
  updateExpenseGroup,
  deleteExpenseGroup,
  getGroupSettlements, // Group-specific settlement retrieval
  addExpense,
  deleteExpense,
} = require("../controllers/expenseGroupController");

// Route for fetching all expense groups and creating a new expense group
router
  .route("/")
  .get(protect, getExpenseGroups)
  .post(protect, createExpenseGroup);

// Settlement routes
router
  .route("/:id/settlements")
  .get(protect, getSettlements)
  .post(protect, createSettlements); // `getSettlements` or `getGroupSettlements` depending on logic

// Completing a specific settlement for a specific expense group
router
  .route("/:groupId/settlements/:settlementId")
  .put(protect, completeSettlement);

// CRUD operations for expense groups
router
  .route("/:id")
  .get(protect, getExpenseGroup)
  .put(protect, updateExpenseGroup)
  .delete(protect, deleteExpenseGroup);

// Expense management routes
router.route("/:id/expenses").post(protect, addExpense);
router.route("/:id/expenses/:expenseId").delete(protect, deleteExpense);

// If `getGroupSettlements` is distinct from `getSettlements`, use a unique route for it
router.route("/:id/group-settlements").get(protect, getGroupSettlements);

module.exports = router;
