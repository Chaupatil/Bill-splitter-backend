const PersonalExpense = require("../models/PersonalExpense");
const { validationResult } = require("express-validator");
const { parseCSV, validateExpenseRow } = require("../utils/csvProcessor");

// Get all personal expenses for a user
exports.getPersonalExpenses = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      category,
      page = 1,
      limit = 25,
      sort = "-date",
    } = req.query;

    const query = { user: req.user.id };

    // Add filters if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate && !isNaN(new Date(startDate))) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate && !isNaN(new Date(endDate))) {
        query.date.$lte = new Date(endDate);
      }
    }

    if (type) query.type = type;
    if (category) query.category = category;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get expenses with pagination
    const expenses = await PersonalExpense.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await PersonalExpense.countDocuments(query);

    // Get summary statistics
    const creditSum = await PersonalExpense.aggregate([
      { $match: { user: req.user._id, type: "credit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const debitSum = await PersonalExpense.aggregate([
      { $match: { user: req.user._id, type: "debit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate total balance
    const totalCredit = creditSum.length > 0 ? creditSum[0].total : 0;
    const totalDebit = debitSum.length > 0 ? debitSum[0].total : 0;
    const balance = totalCredit - totalDebit;

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      summary: {
        totalCredit,
        totalDebit,
        balance,
      },
    });
  } catch (error) {
    console.error("Error fetching personal expenses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching personal expenses",
    });
  }
};

// Add new personal expense
exports.addPersonalExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { amount, type, category, description, date } = req.body;

    const newExpense = new PersonalExpense({
      user: req.user.id,
      amount,
      type,
      category,
      description,
      date: date ? new Date(date) : Date.now(),
    });

    await newExpense.save();

    res.status(201).json({
      success: true,
      data: newExpense,
      message: "Personal expense added successfully",
    });
  } catch (error) {
    console.error("Error adding personal expense:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding personal expense",
    });
  }
};

exports.addMultipleExpenses = async (req, res) => {
  try {
    const { expenses } = req.body;
    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No expenses provided" });
    }

    const valid = expenses.map((e) => ({
      user: req.user.id,
      amount: e.amount,
      type: e.type,
      category: e.category,
      description: e.description || "",
      date: e.date ? new Date(e.date) : new Date(),
    }));

    await PersonalExpense.insertMany(valid);

    res.status(201).json({
      success: true,
      count: valid.length,
      message: `${valid.length} expenses added successfully`,
    });
  } catch (error) {
    console.error("Error in bulk add:", error);
    res.status(500).json({ success: false, message: "Failed to add expenses" });
  }
};

// Get a single personal expense
exports.getPersonalExpenseById = async (req, res) => {
  try {
    const expense = await PersonalExpense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Personal expense not found",
      });
    }

    // Check if the expense belongs to the user
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this expense",
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Error fetching personal expense:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching personal expense",
    });
  }
};

// Update personal expense
exports.updatePersonalExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { amount, type, category, description, date } = req.body;

    let expense = await PersonalExpense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Personal expense not found",
      });
    }

    // Check if the expense belongs to the user
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this expense",
      });
    }

    const updateFields = {};
    if (amount !== undefined) updateFields.amount = amount;
    if (type !== undefined) updateFields.type = type;
    if (category !== undefined) updateFields.category = category;
    if (description !== undefined) updateFields.description = description;
    if (date !== undefined) updateFields.date = new Date(date);

    expense = await PersonalExpense.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: expense,
      message: "Personal expense updated successfully",
    });
  } catch (error) {
    console.error("Error updating personal expense:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating personal expense",
    });
  }
};

// Delete personal expense
exports.deletePersonalExpense = async (req, res) => {
  try {
    const expense = await PersonalExpense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Personal expense not found",
      });
    }

    // Check if the expense belongs to the user
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this expense",
      });
    }

    await PersonalExpense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Personal expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting personal expense:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting personal expense",
    });
  }
};

exports.deleteMultipleExpenses = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No expense IDs provided" });
    }

    const result = await PersonalExpense.deleteMany({
      _id: { $in: ids },
      user: req.user.id,
    });

    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} expenses deleted successfully`,
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete selected expenses",
    });
  }
};

// Get expense statistics
exports.getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const timeFilter = {};
    if (startDate && endDate) {
      timeFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      timeFilter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      timeFilter.date = { $lte: new Date(endDate) };
    }

    // Category distribution for debits
    const categoryStats = await PersonalExpense.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "debit",
          ...timeFilter,
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly summary
    const monthlyStats = await PersonalExpense.aggregate([
      {
        $match: {
          user: req.user._id,
          ...timeFilter,
        },
      },
      {
        $addFields: {
          // Convert to user's timezone (assuming IST UTC+5:30)
          localDate: {
            $dateFromParts: {
              year: { $year: { date: "$date", timezone: "+05:30" } },
              month: { $month: { date: "$date", timezone: "+05:30" } },
              day: { $dayOfMonth: { date: "$date", timezone: "+05:30" } },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: { date: "$localDate", timezone: "+05:30" } },
            month: { $month: { date: "$localDate", timezone: "+05:30" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Process monthly data into a more usable format
    const monthlyData = {};
    monthlyStats.forEach((stat) => {
      const yearMonth = `${stat._id.year}-${String(stat._id.month).padStart(
        2,
        "0"
      )}`;
      if (!monthlyData[yearMonth]) {
        monthlyData[yearMonth] = { credit: 0, debit: 0 };
      }
      monthlyData[yearMonth][stat._id.type] = stat.total;
    });

    res.status(200).json({
      success: true,
      data: {
        categoryDistribution: categoryStats,
        monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
          month,
          credit: data.credit,
          debit: data.debit,
          balance: data.credit - data.debit,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching expense statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching expense statistics",
    });
  }
};

exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const rows = await parseCSV(req.file.buffer);
    const validExpenses = [];
    const errors = [];

    rows.forEach((row, index) => {
      const {
        isValid,
        errors: rowErrors,
        ...expenseData
      } = validateExpenseRow(row);
      if (isValid) {
        validExpenses.push({
          user: req.user.id,
          amount: expenseData.amount,
          type: row.type.toLowerCase(),
          category: row.category.trim(),
          description: (row.description || "").trim(),
          date: row.date ? new Date(row.date) : new Date(),
        });
      } else {
        errors.push({ row: index + 2, errors: rowErrors }); // +2: header + 1-based
      }
    });

    if (validExpenses.length > 0) {
      await PersonalExpense.insertMany(validExpenses);
    }

    res.status(200).json({
      success: true,
      imported: validExpenses.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("CSV upload error:", error);
    res.status(500).json({ success: false, message: "Failed to process CSV" });
  }
};
