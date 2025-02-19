const calculateSettlements = (friends, expenses) => {
  // Calculate total spent by each person
  const balances = {};
  friends.forEach((friend) => {
    balances[friend] = 0;
  });

  // Add up all expenses
  expenses.forEach((expense) => {
    balances[expense.paidBy] += expense.amount;
  });

  // Calculate per person share
  const totalAmount = Object.values(balances).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const perPersonShare = totalAmount / friends.length;

  // Calculate final settlements
  const settlements = [];
  const debtors = [];
  const creditors = [];

  friends.forEach((friend) => {
    const balance = balances[friend] - perPersonShare;
    if (balance < -0.01) {
      debtors.push({ name: friend, amount: -balance });
    } else if (balance > 0.01) {
      creditors.push({ name: friend, amount: balance });
    }
  });

  // Match debtors with creditors
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: parseFloat(amount.toFixed(2)),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) debtors.shift();
    if (creditor.amount < 0.01) creditors.shift();
  }

  return settlements;
};

module.exports = calculateSettlements;
