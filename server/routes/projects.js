const express = require('express');
const db = require('../db');
const { authenticate, requireProjectAccess } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const q = req.user.role === 'admin'
      ? `SELECT p.*,u.name as owner_name,
          (SELECT COUNT(*) FROM tasks WHERE project_id=p.id) as task_count,
          (SELECT COUNT(*) FROM project_members WHERE project_id=p.id) as member_count
         FROM projects p JOIN users u ON p.owner_id=u.id ORDER BY p.created_at DESC`
      : `SELECT p.*,u.name as owner_name,pm.role as my_role,
          (SELECT COUNT(*) FROM tasks WHERE project_id=p.id) as task_count,
          (SELECT COUNT(*) FROM project_members WHERE project_id=p.id) as member_count
         FROM projects p JOIN users u ON p.owner_id=u.id
         LEFT JOIN project_members pm ON pm.project_id=p.id AND pm.user_id=?
         WHERE p.owner_id=? OR pm.user_id=? ORDER BY p.created_at DESC`;
    const rows = req.user.role === 'admin'
      ? await db.all(q)
      : await db.all(q, [req.user.id, req.user.id, req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const result = await db.run(
      'INSERT INTO projects(name,description,owner_id) VALUES(?,?,?)',
      [name, description || '', req.user.id]
    );
    await db.run(
      'INSERT OR IGNORE INTO project_members(project_id,user_id,role) VALUES(?,?,?)',
      [result.lastInsertRowid, req.user.id, 'admin']
    );
    const p = await db.get(
      'SELECT p.*,u.name as owner_name FROM projects p JOIN users u ON p.owner_id=u.id WHERE p.id=?',
      [result.lastInsertRowid]
    );
    res.status(201).json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, requireProjectAccess, async (req, res) => {
  try {
    const p = await db.get(
      'SELECT p.*,u.name as owner_name FROM projects p JOIN users u ON p.owner_id=u.id WHERE p.id=?',
      [req.params.id]
    );
    const members = await db.all(
      `SELECT u.id,u.name,u.email,u.role as system_role,pm.role as project_role
       FROM project_members pm JOIN users u ON pm.user_id=u.id WHERE pm.project_id=?`,
      [req.params.id]
    );
    res.json({ ...p, members });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireProjectAccess, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const p = req.project;
    if (p.owner_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not allowed' });
    await db.run(
      'UPDATE projects SET name=?,description=?,status=? WHERE id=?',
      [name || p.name, description ?? p.description, status || p.status, req.params.id]
    );
    const updated = await db.get(
      'SELECT p.*,u.name as owner_name FROM projects p JOIN users u ON p.owner_id=u.id WHERE p.id=?',
      [req.params.id]
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireProjectAccess, async (req, res) => {
  try {
    if (req.project.owner_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not allowed' });
    await db.run('DELETE FROM projects WHERE id=?', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/members', authenticate, requireProjectAccess, async (req, res) => {
  try {
    const { email, role } = req.body;
    if (req.project.owner_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not allowed' });
    const user = await db.get('SELECT * FROM users WHERE email=?', [email?.toLowerCase()]);
    if (!user) return res.status(404).json({ error: 'No user with that email' });
    await db.run(
      'INSERT OR REPLACE INTO project_members(project_id,user_id,role) VALUES(?,?,?)',
      [req.params.id, user.id, role || 'member']
    );
    res.json({ message: 'Member added', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id/members/:userId', authenticate, requireProjectAccess, async (req, res) => {
  try {
    if (req.project.owner_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not allowed' });
    await db.run('DELETE FROM project_members WHERE project_id=? AND user_id=?',
      [req.params.id, req.params.userId]);
    res.json({ message: 'Member removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;