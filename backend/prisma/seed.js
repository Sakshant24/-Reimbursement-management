const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...\n');
  const hash = await bcrypt.hash('Demo@1234', 12);

  // 0. Clean DB
  await prisma.approval.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.approvalRule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // 1. Company
  const company = await prisma.company.create({
    data: { name: 'TechCorp India', country: 'India', defaultCurrency: 'INR' }
  });
  console.log(`✅ Company: ${company.name} (${company.defaultCurrency})`);

  // 2. Users
  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@techcorp.com', password: hash, role: 'ADMIN', companyId: company.id }
  });
  const sarah = await prisma.user.create({
    data: { name: 'Sarah', email: 'sarah@techcorp.com', password: hash, role: 'MANAGER', companyId: company.id }
  });
  const finance = await prisma.user.create({
    data: { name: 'Finance', email: 'finance@techcorp.com', password: hash, role: 'MANAGER', companyId: company.id }
  });
  const cfo = await prisma.user.create({
    data: { name: 'CFO', email: 'cfo@techcorp.com', password: hash, role: 'MANAGER', companyId: company.id }
  });
  const raj = await prisma.user.create({
    data: { name: 'Raj', email: 'raj@techcorp.com', password: hash, role: 'EMPLOYEE', companyId: company.id, managerId: sarah.id }
  });
  console.log(`✅ Users: admin, sarah (manager), finance, cfo, raj (employee -> sarah)`);

  // 3. Hybrid Approval Rule
  const rule = await prisma.approvalRule.create({
    data: {
      companyId: company.id,
      name: 'Standard Hybrid Rule',
      ruleType: 'HYBRID',
      isManagerFirst: true,
      thresholdPercentage: 60,
      specificApproverId: cfo.id,
      approverSequence: {
        create: [
          { userId: sarah.id, stepOrder: 1 },
          { userId: finance.id, stepOrder: 2 },
          { userId: cfo.id, stepOrder: 3 },
        ]
      }
    }
  });
  console.log(`✅ Rule: "${rule.name}" (HYBRID — 60% OR CFO)`);

  // 4. Expense 1 — Pending at Step 1 (Sarah's queue)
  const exp1 = await prisma.expense.create({
    data: {
      userId: raj.id, companyId: company.id, amount: 15000, currency: 'INR',
      convertedAmount: 15000, exchangeRate: 1, category: 'TRAVEL',
      description: 'Flight to Mumbai for client meeting', date: new Date('2025-03-15'),
      status: 'PENDING', currentStep: 1, ruleId: rule.id,
      approvals: { create: [
        { approverId: sarah.id, stepOrder: 1, isManagerStep: true, status: 'PENDING' },
        { approverId: finance.id, stepOrder: 2, status: 'PENDING' },
        { approverId: cfo.id, stepOrder: 3, status: 'PENDING' },
      ]}
    }
  });
  console.log(`✅ Expense 1: ₹15,000 Travel — PENDING (at Sarah Step 1)`);

  // 5. Expense 2 — Mid-chain ($200 USD, Sarah approved, Finance pending)
  const exp2 = await prisma.expense.create({
    data: {
      userId: raj.id, companyId: company.id, amount: 200, currency: 'USD',
      convertedAmount: 16640, exchangeRate: 83.2, category: 'FOOD',
      description: 'Team lunch with client', date: new Date('2025-03-10'),
      status: 'PENDING', currentStep: 2, ruleId: rule.id,
      approvals: { create: [
        { approverId: sarah.id, stepOrder: 1, isManagerStep: true, status: 'APPROVED', comments: 'Looks good', respondedAt: new Date('2025-03-11T10:00:00Z') },
        { approverId: finance.id, stepOrder: 2, status: 'PENDING' },
        { approverId: cfo.id, stepOrder: 3, status: 'PENDING' },
      ]}
    }
  });
  console.log(`✅ Expense 2: $200 USD Food (₹16,640) — PENDING mid-chain (Sarah ✅, Finance pending)`);

  // 6. Expense 3 — Auto-approved via HYBRID (CFO approved at step 2)
  const exp3 = await prisma.expense.create({
    data: {
      userId: raj.id, companyId: company.id, amount: 50000, currency: 'INR',
      convertedAmount: 50000, exchangeRate: 1, category: 'ACCOMMODATION',
      description: 'Hotel stay during Bangalore conference', date: new Date('2025-03-05'),
      status: 'APPROVED', currentStep: 2, ruleId: rule.id,
      approvals: { create: [
        { approverId: sarah.id, stepOrder: 1, isManagerStep: true, status: 'APPROVED', comments: 'Approved', respondedAt: new Date('2025-03-06T09:00:00Z') },
        { approverId: cfo.id, stepOrder: 2, status: 'APPROVED', comments: 'Auto-approved by CFO trigger', respondedAt: new Date('2025-03-06T11:00:00Z') },
        { approverId: finance.id, stepOrder: 3, status: 'PENDING' },
      ]}
    }
  });
  console.log(`✅ Expense 3: ₹50,000 Accommodation — AUTO-APPROVED (CFO hybrid trigger)`);

  // 7. Expense 4 — Rejected with reason
  const exp4 = await prisma.expense.create({
    data: {
      userId: raj.id, companyId: company.id, amount: 8000, currency: 'INR',
      convertedAmount: 8000, exchangeRate: 1, category: 'OFFICE_SUPPLIES',
      description: 'Printer cartridges and stationery', date: new Date('2025-02-28'),
      status: 'REJECTED', currentStep: 2, ruleId: rule.id,
      approvals: { create: [
        { approverId: sarah.id, stepOrder: 1, isManagerStep: true, status: 'APPROVED', respondedAt: new Date('2025-03-01T08:00:00Z') },
        { approverId: finance.id, stepOrder: 2, status: 'REJECTED', comments: 'Missing receipt. Please resubmit with valid receipt attached.', respondedAt: new Date('2025-03-01T14:00:00Z') },
        { approverId: cfo.id, stepOrder: 3, status: 'PENDING' },
      ]}
    }
  });
  console.log(`✅ Expense 4: ₹8,000 Office Supplies — REJECTED (Finance: "Missing receipt")`);

  // 8. Expense 5 — Fully approved (€500 EUR, all steps cleared)
  const exp5 = await prisma.expense.create({
    data: {
      userId: raj.id, companyId: company.id, amount: 500, currency: 'EUR',
      convertedAmount: 45750, exchangeRate: 91.5, category: 'CONFERENCE',
      description: 'AWS Summit Europe registration + travel', date: new Date('2025-02-15'),
      status: 'APPROVED', currentStep: 3, ruleId: rule.id,
      approvals: { create: [
        { approverId: sarah.id, stepOrder: 1, isManagerStep: true, status: 'APPROVED', comments: 'Approved — important conference', respondedAt: new Date('2025-02-16T09:00:00Z') },
        { approverId: finance.id, stepOrder: 2, status: 'APPROVED', comments: 'Budget available', respondedAt: new Date('2025-02-16T15:00:00Z') },
        { approverId: cfo.id, stepOrder: 3, status: 'APPROVED', comments: 'Strategic — approved', respondedAt: new Date('2025-02-17T10:00:00Z') },
      ]}
    }
  });
  console.log(`✅ Expense 5: €500 EUR Conference (₹45,750) — FULLY APPROVED (all 3 steps)\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Demo data loaded. Login credentials:');
  console.log('   admin@techcorp.com    / Demo@1234  (Admin)');
  console.log('   sarah@techcorp.com    / Demo@1234  (Manager)');
  console.log('   finance@techcorp.com  / Demo@1234  (Manager)');
  console.log('   cfo@techcorp.com      / Demo@1234  (Manager)');
  console.log('   raj@techcorp.com      / Demo@1234  (Employee)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
