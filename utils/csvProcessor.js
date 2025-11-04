// const csv = require("csv-parser");
// const { Readable } = require("stream");

// const parseCSV = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const results = [];
//     const stream = Readable.from(buffer.toString());

//     stream
//       .pipe(csv())
//       .on("data", (data) => results.push(data))
//       .on("end", () => resolve(results))
//       .on("error", (err) => reject(err));
//   });
// };

// const validateExpenseRow = (row) => {
//   const errors = [];
//   const amount = parseFloat(row.amount);
//   if (!row.amount || isNaN(amount) || amount <= 0) {
//     errors.push("Invalid amount");
//   }
//   if (!["credit", "debit"].includes(row.type?.toLowerCase())) {
//     errors.push("Type must be 'credit' or 'debit'");
//   }
//   if (!row.category?.trim()) {
//     errors.push("Category is required");
//   }
//   return { isValid: errors.length === 0, errors, amount, ...row };
// };

// module.exports = { parseCSV, validateExpenseRow };

const csv = require("csv-parser");
const { Readable } = require("stream");

/**
 * Parses a CSV buffer into JSON objects.
 * @param {Buffer|string} buffer
 * @returns {Promise<Array<Object>>}
 */
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

/**
 * Parses Excel-style dates:
 * - "03-May-25" → 2025-05-03
 * - Numeric Excel date → converts to JS Date
 * @param {string|number} dateStr
 * @returns {Date}
 */
const parseExcelDate = (dateInput) => {
  if (!dateInput) return new Date();

  // Convert to string for splitting
  const dateStr = dateInput.toString().trim();

  // Handle numeric Excel serial date
  if (!isNaN(Number(dateStr))) {
    const serial = Number(dateStr);
    if (serial > 30) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
    } else {
      return new Date(); // invalid/fractional numbers fallback
    }
  }

  // Handle string like "03-May-25"
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date();

  const [day, monStr, yr] = parts;
  const months = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const month = months[monStr];
  if (month === undefined) return new Date();

  let year = parseInt(yr, 10);
  if (year < 100) year += 2000;

  return new Date(year, month, parseInt(day, 10));
};

/**
 * Validates and sanitizes a single CSV row for PersonalExpense.
 * @param {Object} row
 * @returns {Object} { isValid, errors, amount, type, category, description, date }
 */
const validateExpenseRow = (row) => {
  const errors = [];

  // ----- Amount -----
  const rawAmount = row.amount
    ? row.amount.toString().replace(/,/g, "").trim()
    : "";
  const amount = parseFloat(rawAmount);
  if (!rawAmount || isNaN(amount) || amount <= 0) {
    errors.push(`Invalid amount: "${row.amount}"`);
  }

  // ----- Type -----
  const type = row.type?.toLowerCase()?.trim();
  if (!["credit", "debit"].includes(type)) {
    errors.push(`Type must be 'credit' or 'debit', got: "${row.type}"`);
  }

  // ----- Category -----
  const category = row.category?.trim();
  if (!category) {
    errors.push("Category is required");
  }

  // ----- Description -----
  const description = row.description?.trim() || "";

  // ----- Date -----
  const date = parseExcelDate(row.date);

  return {
    isValid: errors.length === 0,
    errors,
    amount,
    type,
    category,
    description,
    date,
  };
};

module.exports = { parseCSV, validateExpenseRow };
