const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const ruleEngine = require('./ruleEngine.service');

exports.approveStep = async (user, expenseId, comments) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId, companyId: user.companyId },
    include: { approvals: true, rule: true }
  });

  if (!expense) throw new AppError('Expense not found', 404);
  if (expense.status !== 'PENDING') throw new AppError(`Expense is already ${expense.status}`, 400);

  const currentApproval = expense.approvals.find(
    a => a.stepOrder === expense.currentStep && a.approverId === user.userId
  );
  if (!currentApproval) throw new AppError('You are not the active approver for this step', 403);
  if (currentApproval.status !== 'PENDING') throw new AppError('Already responded to this expense step', 400);

  // Mark this step approved
  await prisma.approval.update({
    where: { id: currentApproval.id },
    data: { status: 'APPROVED', comments, respondedAt: new Date() }
  });

  // Re-fetch fresh state and run rule engine
  const updatedExpense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { approvals: true, rule: true }
  });
  
  await ruleEngine.evaluate(updatedExpense);
  
  return await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { approvals: true }
  });
};

exports.rejectStep = async (user, expenseId, comments) => {
  if (!comments || comments.trim().length < 3)
    throw new AppError('Rejection reason is required (min 3 chars)', 400);

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId, companyId: user.companyId },
    include: { approvals: true }
  });

  if (!expense) throw new AppError('Expense not found', 404);
  if (expense.status !== 'PENDING') throw new AppError(`Expense is already ${expense.status}`, 400);

  const currentApproval = expense.approvals.find(
    a => a.stepOrder === expense.currentStep && a.approverId === user.userId
  );
  if (!currentApproval) throw new AppError('You are not the active approver for this step', 403);
  if (currentApproval.status !== 'PENDING') throw new AppError('Already responded', 400);

  // Rejection immediately terminates the chain
  await prisma.$transaction([
    prisma.approval.update({
      where: { id: currentApproval.id },
      data: { status: 'REJECTED', comments, respondedAt: new Date() }
    }),
    prisma.expense.update({
      where: { id: expenseId },
      data: { status: 'REJECTED' }
    })
  ]);

  return await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { approvals: true }
  });
};

exports.getPendingApprovals = async (user) => {
  // Find all expenses where this user is the active approver at the current step
  const expenses = await prisma.expense.findMany({
    where: {
      companyId: user.companyId,
      status: 'PENDING',
      approvals: {
        some: {
          approverId: user.userId,
          status: 'PENDING'
        }
      }
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      approvals: true
    }
  });

  // We filter exactly if this user is the active approver for the 'currentStep'
  const pendingQueue = expenses.filter(exp => {
    const activeApproval = exp.approvals.find(a => a.stepOrder === exp.currentStep);
    return activeApproval && activeApproval.approverId === user.userId && activeApproval.status === 'PENDING';
  });

  return pendingQueue;
};
