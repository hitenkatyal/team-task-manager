const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password min 6 chars' });
    if (await db.get('SELECT id FROM users WHERE email=?', [email.toLowerCase()]))
      return res.status(409).json({ error: 'Email already registered' });

    const count = await db.get('SELECT COUNT(*) as c FROM users');
    const role = count.c == 0 ? 'admin' : 'member';
    const hashed = bcrypt.hashSync(password, 10);
    const result = await db.run(
      'INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)',
      [name, email.toLowerCase(), hashed, role]
    );
    const user = { id: result.lastInsertRowid, name, email: email.toLowerCase(), role };
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields required' });
    const user = await db.get('SELECT * FROM users WHERE email=?', [email.toLowerCase()]);
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...u } = user;
    res.json({ token, user: u });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;