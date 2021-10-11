const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});


// Gets all without authentication or authorization.
app.get('/todos', async(req, res) => {
  try {
    const data = await client.query('SELECT * from todos');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


// 🔐 Posts new todos to DB with an accurate owner_id
app.post('/api/todos', async(req, res) => {
  try {
    const data = await client.query('INSERT INTO todos (todo_description, is_complete, owner_id) VALUES($1, $2, $3) RETURNING *', [req.body.todo_description, false, req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


// 🔐 Gets todos to DB related to an owner_id
app.get('/api/todos', async(req, res) => {
  try {
    const data = await client.query('SELECT * FROM todos WHERE owner_id = $1', [req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


// 🔐 Delete destroys a specific todo related to an owner_id
app.delete('/api/todos'/* ❗the /:id is added on front end.❗ */, async(req, res) => {
  try {
    const data = await client.query('DELETE FROM todos WHERE owner_id = $1 AND id = $2 RETURNING *', [req.userId, req.params.id]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


// 🔐 PUT updates a specific todo related to an owner_id
app.put('/api/todos'/* ❗the /:id is added on front end.❗ */, async(req, res) => {
  try {
    const data = await client.query(`UPDATE todos
    SET todo_description=$1, is_complete=$2
    WHERE owner_id = $3 AND id = $4 RETURNING *`, [req.body.todo_description, req.body.is_complete, req.userId, req.params.id]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
