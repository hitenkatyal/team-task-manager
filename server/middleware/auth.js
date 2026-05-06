const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'taskmanager_dev_secret';

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    const user = await db.get('SELECT id,name,email,role FROM users WHERE id=?', [decoded.id]);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user; next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

const requireProjectAccess = async (req, res, next) => {
  const pid = req.params.id || req.params.projectId || req.body.project_id;
  if (!pid) return next();
  const project = await db.get('SELECT * FROM projects WHERE id=?', [pid]);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const member = await db.get(
    'SELECT * FROM project_members WHERE project_id=? AND user_id=?', [pid, req.user.id]
  );
  if (req.user.role === 'admin' || project.owner_id === req.user.id || member) {
    req.project = project; req.projectMember = member; return next();
  }
  res.status(403).json({ error: 'No access' });
};

module.exports = { authenticate, requireAdmin, requireProjectAccess, JWT_SECRET };