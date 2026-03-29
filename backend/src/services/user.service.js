const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const AppError = require('../utils/AppError');

exports.createUser = async (adminUser, { name, email, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email must be unique across the whole system', 400);

  const password = await bcrypt.hash('Temp@1234', 12);
  
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password,
      role,
      companyId: adminUser.companyId
    }
  });

  const userCopy = { ...newUser };
  delete userCopy.password;
  userCopy.rawPassword = 'Temp@1234';

  return userCopy;
};

exports.getUsers = async (adminUser) => {
  const users = await prisma.user.findMany({
    where: { companyId: adminUser.companyId },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true, managerId: true
    }
  });
  return users;
};

exports.changeRole = async (adminUser, targetUserId, newRole) => {
  if (adminUser.userId === targetUserId) {
    throw new AppError('Admin cannot demote themselves', 400);
  }

  const targetUser = await prisma.user.findFirst({
    where: { id: targetUserId, companyId: adminUser.companyId }
  });
  if (!targetUser) throw new AppError('User not found in your company', 404);

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole }
  });

  const userCopy = { ...updated };
  delete userCopy.password;
  return userCopy;
};

exports.assignManager = async (adminUser, targetUserId, managerId) => {
  // manager assignment target must be role MANAGER in same company
  const manager = await prisma.user.findFirst({
    where: { id: managerId, companyId: adminUser.companyId, role: 'MANAGER' }
  });
  if (!manager) throw new AppError('Manager not found or is not a MANAGER role', 400);

  const targetUser = await prisma.user.findFirst({
    where: { id: targetUserId, companyId: adminUser.companyId }
  });
  if (!targetUser) throw new AppError('User not found in your company', 404);

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { managerId }
  });

  const userCopy = { ...updated };
  delete userCopy.password;
  return userCopy;
};
