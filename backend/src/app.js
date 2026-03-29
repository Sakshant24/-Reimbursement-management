require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ success: true });
});

// Mount Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const expenseRoutes = require('./routes/expense.routes');
const approvalRoutes = require('./routes/approval.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/approvals', approvalRoutes);

// Serve static receipts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message, data: null });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
