const csv = require("csv-parser");
const { Readable } = require("stream");

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

const validateExpenseRow = (row) => {
  const errors = [];
  const amount = parseFloat(row.amount);
  if (!row.amount || isNaN(amount) || amount <= 0) {
    errors.push("Invalid amount");
  }
  if (!["credit", "debit"].includes(row.type?.toLowerCase())) {
    errors.push("Type must be 'credit' or 'debit'");
  }
  if (!row.category?.trim()) {
    errors.push("Category is required");
  }
  return { isValid: errors.length === 0, errors, amount, ...row };
};

module.exports = { parseCSV, validateExpenseRow };
