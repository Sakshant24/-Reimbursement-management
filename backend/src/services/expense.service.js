const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { convertCurrency } = require('../utils/currency.util');

exports.createExpense = async (user, data, file) => {
  const { amount, currency, category, description, date, ocrRawText } = data;

  if (amount <= 0) throw new AppError('Amount must be greater than 0', 400);
  if (new Date(date) > new Date()) throw new AppError('Date cannot be in the future', 400);

  // Get user's company and default currency
  const company = await prisma.company.findUnique({ where: { id: user.companyId } });
  
  // Convert currency
  const { convertedAmount, exchangeRate } = await convertCurrency(
    Number(amount), 
    currency, 
    company.defaultCurrency
  );

  // Find rule
  let rule = await prisma.approvalRule.findFirst({
    where: { companyId: user.companyId, categoryFilter: category }
  });
  if (!rule) {
    rule = await prisma.approvalRule.findFirst({
      where: { companyId: user.companyId, categoryFilter: null }
    });
  }

  if (!rule) {
    throw new AppError('No approval rule configured for this category or company. Please ask your admin to set one up.', 400);
  }

  const receiptPath = file ? file.path : null;

  return await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        userId: user.userId,
        companyId: user.companyId,
        amount,
        currency,
        convertedAmount,
        exchangeRate,
        category,
        description,
        date: new Date(date),
        receiptPath,
        ocrRawText,
        status: 'PENDING',
        currentStep: 1,
        ruleId: rule.id
      }
    });

    // Build approvals
    let currentStepOrder = 1;

    // Check if manager is first
    if (rule.isManagerFirst) {
      const dbUser = await tx.user.findUnique({ where: { id: user.userId } });
      if (dbUser.managerId) {
        await tx.approval.create({
          data: {
            expenseId: expense.id,
            approverId: dbUser.managerId,
            stepOrder: currentStepOrder,
            isManagerStep: true,
            status: 'PENDING'
          }
        });
        currentStepOrder++;
      }
    }

    // Sequence provided by rule
    let sequence = [];
    if (rule.approverSequence) {
      let parsed = typeof rule.approverSequence === 'string' 
        ? JSON.parse(rule.approverSequence)
        : rule.approverSequence;
        
      if (!Array.isArray(parsed) && parsed.create) {
        parsed = parsed.create;
      }
      if (Array.isArray(parsed)) {
        sequence = parsed;
      }
    }

    for (const step of sequence) {
      await tx.approval.create({
        data: {
          expenseId: expense.id,
          approverId: step.userId,
          // Re-map stepOrder simply incrementally after manager
          stepOrder: currentStepOrder,  
          isManagerStep: false,
          status: 'PENDING'
        }
      });
      currentStepOrder++;
    }

    return await tx.expense.findUnique({
      where: { id: expense.id },
      include: { approvals: true }
    });
  });
};

exports.getExpenses = async (user) => {
  let whereClause = { companyId: user.companyId };
  
  if (user.role === 'EMPLOYEE') {
    whereClause.userId = user.userId;
  } else if (user.role === 'MANAGER') {
    // Managers see their own AND their subordinates'
    const team = await prisma.user.findMany({ where: { managerId: user.userId } });
    const teamIds = team.map(t => t.id);
    teamIds.push(user.userId);
    whereClause.userId = { in: teamIds };
  }

  return await prisma.expense.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      rule: { select: { name: true } }
    }
  });
};

exports.getExpenseById = async (user, expenseId) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId, companyId: user.companyId },
    include: {
      approvals: {
        include: { approver: { select: { id: true, name: true, role: true } } },
        orderBy: { stepOrder: 'asc' }
      },
      user: { select: { name: true, email: true } }
    }
  });

  if (!expense) throw new AppError('Expense not found', 404);

  // Check access for employee 
  if (user.role === 'EMPLOYEE' && expense.userId !== user.userId) {
    throw new AppError('Access denied', 403);
  }
  
  return expense;
};

exports.adminOverride = async (user, expenseId, { status, reason }) => {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, companyId: user.companyId }
  });

  if (!expense) throw new AppError('Expense not found in your company', 404);

  let appendedOcrRawText = expense.ocrRawText || '';
  appendedOcrRawText += `\n[AUDIT] Admin override by ${user.name}: Forced status to ${status}. Reason: ${reason}`;

  const updated = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      status,
      ocrRawText: appendedOcrRawText
    }
  });

  await prisma.approval.updateMany({
    where: { expenseId, status: 'PENDING' },
    data: {
      status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      comments: `Admin Override: ${reason}`
    }
  });

  return updated;
};
