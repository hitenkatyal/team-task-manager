require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/users',    require('./routes/users'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve React in production
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/.*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));