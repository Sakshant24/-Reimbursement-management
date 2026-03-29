const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const prisma = require('../prisma');
const AppError = require('../utils/AppError');

// In-memory cache for currency
const currencyCache = new Map();

exports.signup = async ({ name, email, password, companyName, country }) => {
  // Check if email exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('Email already in use', 400);

  // Derive defaultCurrency from country using restcountries API
  let defaultCurrency = 'USD'; // fallback
  if (currencyCache.has(country.toLowerCase())) {
    defaultCurrency = currencyCache.get(country.toLowerCase());
  } else {
    try {
      const response = await axios.get(`https://restcountries.com/v3.1/name/${country}?fields=currencies`);
      if (response.data && response.data.length > 0) {
        const currencies = Object.keys(response.data[0].currencies);
        if (currencies.length > 0) {
          defaultCurrency = currencies[0];
          currencyCache.set(country.toLowerCase(), defaultCurrency);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch currency for country ${country}, using fallback USD`);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        country,
        defaultCurrency
      }
    });

    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        companyId: company.id
      }
    });

    return { company, user };
  });

  const { user } = result;
  
  const token = jwt.sign(
    { userId: user.id, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const userCopy = { ...user };
  delete userCopy.password;

  return { token, user: userCopy };
};

exports.login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  const token = jwt.sign(
    { userId: user.id, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const userCopy = { ...user };
  delete userCopy.password;

  return { token, user: userCopy };
};

exports.getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true }
  });
  if (!user) throw new AppError('User not found', 404);

  const userCopy = { ...user };
  delete userCopy.password;
  
  return userCopy;
};
