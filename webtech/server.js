const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/expense-tracker', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the User model
const User = mongoose.model('User', {
  username: String,
  password: String
});

// Define the Expense model
const Expense = mongoose.model('Expense', {
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  category: String,
  date: Date
});

// Create an Express app
const app = express();

// Middleware to authenticate requests
app.use((req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send({ message: 'Access denied' });
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) return res.status(401).send({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
});

// API endpoint to register a new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username }, (err, user) => {
    if (user) return res.status(400).send({ message: 'Username already taken' });
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    newUser.save((err, user) => {
      if (err) return res.status(500).send({ message: 'Error creating user' });
      res.send({ message: 'User created successfully' });
    });
  });
});

// API endpoint to login a user
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username }, (err, user) => {
    if (!user) return res.status(401).send({ message: 'Invalid username or password' });
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) return res.status(401).send({ message: 'Invalid username or password' });
    const token = jwt.sign({ _id: user._id }, 'secretkey', { expiresIn: '1h' });
    res.send({ token });
  });
});

// API endpoint to retrieve expenses for a user
app.get('/expenses', (req, res) => {
  Expense.find({ user: req.user._id }, (err, expenses) => {
    if (err) return res.status(500).send({ message: 'Error retrieving expenses' });
    res.send(expenses);
  });
});

// API endpoint to create a new expense
app.post('/expenses', (req, res) => {
  const { amount, category, date } = req.body;
  const newExpense = new Expense({ user: req.user._id, amount, category, date });
  newExpense.save((err, expense) => {
    if (err) return res.status(500).send({ message: 'Error creating expense' });
    res.send({ message: 'Expense created successfully' });
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});