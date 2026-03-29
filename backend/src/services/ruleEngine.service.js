const prisma = require('../prisma');

async function evaluate(expense) {
  const rule = expense.rule;
  const approvals = expense.approvals;
  const total = approvals.length;
  // Get all approvals that are APPROVED
  const approved = approvals.filter(a => a.status === 'APPROVED');
  const approvedCount = approved.length;
  const approvedUserIds = approved.map(a => a.approverId);

  // --- SEQUENTIAL (no condition): just advance step ---
  if (rule.ruleType === 'SEQUENTIAL') {
    return await advanceOrComplete(expense);
  }

  // --- PERCENTAGE ---
  if (rule.ruleType === 'PERCENTAGE') {
    const pct = Number(rule.thresholdPercentage);
    if (total > 0 && (approvedCount / total) * 100 >= pct) {
      return await finalizeExpense(expense.id, 'APPROVED');
    }
    return await advanceOrComplete(expense);
  }

  // --- SPECIFIC ---
  if (rule.ruleType === 'SPECIFIC') {
    if (approvedUserIds.includes(rule.specificApproverId)) {
      return await finalizeExpense(expense.id, 'APPROVED');
    }
    return await advanceOrComplete(expense);
  }

  // --- HYBRID ---
  if (rule.ruleType === 'HYBRID') {
    const pct = Number(rule.thresholdPercentage);
    const pctMet = total > 0 && (approvedCount / total) * 100 >= pct;
    const specificMet = approvedUserIds.includes(rule.specificApproverId);
    if (pctMet || specificMet) {
      return await finalizeExpense(expense.id, 'APPROVED');
    }
    return await advanceOrComplete(expense);
  }
}

async function advanceOrComplete(expense) {
  const nextStep = expense.currentStep + 1;
  const nextApproval = expense.approvals.find(a => a.stepOrder === nextStep);
  if (nextApproval) {
    // Move to next step
    await prisma.expense.update({
      where: { id: expense.id },
      data: { currentStep: nextStep }
    });
  } else {
    // No more steps — fully approved
    await finalizeExpense(expense.id, 'APPROVED');
  }
}

async function finalizeExpense(expenseId, status) {
  await prisma.expense.update({
    where: { id: expenseId },
    data: { status }
  });
}

module.exports = {
  evaluate,
  advanceOrComplete,
  finalizeExpense
};
