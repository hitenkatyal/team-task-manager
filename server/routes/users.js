const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    res.json(await db.all(`
      SELECT u.id,u.name,u.email,u.role,u.created_at,
        (SELECT COUNT(*) FROM projects WHERE owner_id=u.id) as projects_owned,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to=u.id) as tasks_assigned
      FROM users u ORDER BY u.created_at DESC`));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/search', authenticate, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json([]);
    res.json(await db.all('SELECT id,name,email,role FROM users WHERE email LIKE ? LIMIT 10', [`%${email}%`]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    await db.run('UPDATE users SET role=? WHERE id=?', [role, req.params.id]);
    res.json(await db.get('SELECT id,name,email,role FROM users WHERE id=?', [req.params.id]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await db.get('SELECT id,name,email,role,created_at FROM users WHERE id=?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;