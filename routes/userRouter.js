const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // hash users passwords
const jwt = require('jsonwebtoken'); // auth token that signifies user is logged in
const auth = require('../middleware/auth');

const User = require('../models/user');

// create a user.
router.post('/register', async (req, res) => {
  try {
    const { username, password, passwordCheck } = req.body;

    if (!username || !password || !passwordCheck)
      return res.status(400).json({ msg: 'Not all fields have been entered.' });

    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: 'Password length must be greater than 6 characters.' });
    }

    if (password !== passwordCheck)
      return res
        .status(400)
        .json({ msg: 'Enter the same password twice for verification.' });

    const existingUser = await User.findOne({ username: username });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: 'An account with this email already exists.' });
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    //Could have also just done:
    //const passwordHash = await bcrypt.hash(password, 10);
    let newUser = new User({
      username,
      passwordHash: passwordHash,
      numNotes: 0,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ msg: 'Not all fields have been entered.' });
    const user = await User.findOne({ username: username });

    if (!user) {
      return res
        .status(400)
        .json({ msg: 'No account with this name has been registered.' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        username: user.username,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
