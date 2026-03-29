const prisma = require('../prisma');
const AppError = require('../utils/AppError');

exports.createRule = async (adminUser, data) => {
  const { name, categoryFilter, isManagerFirst, ruleType, thresholdPercentage, specificApproverId, approverSequence } = data;

  if (specificApproverId) {
    const approver = await prisma.user.findFirst({
      where: { id: specificApproverId, companyId: adminUser.companyId }
    });
    if (!approver) throw new AppError('Specific approver not found in this company', 400);
  }

  validateSequence(approverSequence, isManagerFirst);

  const rule = await prisma.approvalRule.create({
    data: {
      companyId: adminUser.companyId,
      name,
      categoryFilter,
      isManagerFirst,
      ruleType,
      thresholdPercentage,
      specificApproverId,
      approverSequence
    }
  });

  return rule;
};

exports.getRules = async (adminUser) => {
  return await prisma.approvalRule.findMany({
    where: { companyId: adminUser.companyId },
    orderBy: { createdAt: 'desc' }
  });
};

exports.updateRule = async (adminUser, ruleId, data) => {
  const rule = await prisma.approvalRule.findFirst({
    where: { id: ruleId, companyId: adminUser.companyId }
  });
  if (!rule) throw new AppError('Rule not found', 404);

  const { name, categoryFilter, isManagerFirst, ruleType, thresholdPercentage, specificApproverId, approverSequence } = data;

  if (specificApproverId) {
    const approver = await prisma.user.findFirst({
      where: { id: specificApproverId, companyId: adminUser.companyId }
    });
    if (!approver) throw new AppError('Specific approver not found in this company', 400);
  }

  if (approverSequence) {
    validateSequence(approverSequence, isManagerFirst !== undefined ? isManagerFirst : rule.isManagerFirst);
  }

  const updated = await prisma.approvalRule.update({
    where: { id: ruleId },
    data
  });
  return updated;
};

exports.deleteRule = async (adminUser, ruleId) => {
  const rule = await prisma.approvalRule.findFirst({
    where: { id: ruleId, companyId: adminUser.companyId }
  });
  if (!rule) throw new AppError('Rule not found', 404);

  // Check if any PENDING expenses are using this rule
  const pendingExpenses = await prisma.expense.count({
    where: { ruleId, status: 'PENDING' }
  });

  if (pendingExpenses > 0) {
    throw new AppError('Cannot delete rule. It is being used by pending expenses.', 400);
  }

  await prisma.approvalRule.delete({ where: { id: ruleId } });
  return { message: 'Rule deleted successfully' };
};

function validateSequence(sequence, isManagerFirst) {
  if (!Array.isArray(sequence) || sequence.length === 0) {
    throw new AppError('Approver sequence array is required (min 1 entry)', 400);
  }
  
  const expectedStart = isManagerFirst ? 2 : 1;
  const orders = sequence.map(s => s.stepOrder).sort((a,b) => a-b);
  
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== expectedStart + i) {
      throw new AppError(`Step orders must be contiguous and sequential starting from ${expectedStart}`, 400);
    }
  }

  const uniqueUsers = new Set(sequence.map(s => s.userId));
  if (uniqueUsers.size !== sequence.length) {
    throw new AppError('A user cannot appear multiple times in the sequence', 400);
  }
}
