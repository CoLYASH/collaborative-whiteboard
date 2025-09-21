const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./User'); // adjust path if needed
const router = express.Router();
console.log("✅ auth.js loaded");

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log('Received registration:', req.body); // 👈 debug

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});
router.post('/ping', (req, res) => {
  res.json({ message: "pong" });
});

router.post('/login', async (req, res) => {
  console.log('🔐 POST /login hit');
  console.log('Request body:', req.body);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ User not found with username:", username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password does not match for user:", username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = `${user._id}-${Date.now()}`;
    console.log("✅ Login successful:", user.username);

    res.status(200).json({
      message: 'Login successful',
      token,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});


module.exports = router;