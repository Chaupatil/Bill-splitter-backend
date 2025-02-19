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
// } = require("../controllers/expenseGroupController");

// router.route("/").get(getExpenseGroups).post(createExpenseGroup);

// router.route("/:id/settlements").get(getSettlements).post(createSettlements);

// router.route("/:groupId/settlements/:settlementId").put(completeSettlement);

// router
//   .route("/:id")
//   .get(getExpenseGroup)
//   .put(updateExpenseGroup)
//   .delete(deleteExpenseGroup);

// router.get("/:id/settlements", getGroupSettlements);

// module.exports = router;

const express = require("express");
const router = express.Router();
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
  getGroupSettlements,
  addExpense,
  deleteExpense,
} = require("../controllers/expenseGroupController");

router.route("/").get(getExpenseGroups).post(createExpenseGroup);

router.route("/:id/settlements").get(getSettlements).post(createSettlements);

router.route("/:groupId/settlements/:settlementId").put(completeSettlement);

router
  .route("/:id")
  .get(getExpenseGroup)
  .put(updateExpenseGroup)
  .delete(deleteExpenseGroup);

// New routes for expense management
router.route("/:id/expenses").post(addExpense);
router.route("/:id/expenses/:expenseId").delete(deleteExpense);

router.get("/:id/settlements", getGroupSettlements);

module.exports = router;
