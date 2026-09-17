require('dotenv').config();
const express = require('express');
const projectsRouter = require('./routes/projects');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/projects', projectsRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Bigpush accountability API listening on port ${port}`);
});
