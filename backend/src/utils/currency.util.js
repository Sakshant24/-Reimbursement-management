const axios = require('axios');
const AppError = require('./AppError');

exports.convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return { convertedAmount: amount, exchangeRate: 1 };
  }
  try {
    const res = await axios.get(`${process.env.EXCHANGE_API_BASE}/${fromCurrency.toUpperCase()}`);
    const rate = res.data.rates[toCurrency.toUpperCase()];
    if (!rate) throw new AppError('Currency conversion rate not found', 400);
    return {
      convertedAmount: Number((amount * rate).toFixed(2)),
      exchangeRate: Number(rate.toFixed(6))
    };
  } catch (err) {
    throw new AppError('Failed to fetch currency rates', 500);
  }
};
