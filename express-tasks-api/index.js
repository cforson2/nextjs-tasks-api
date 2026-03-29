// index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Middleware — these run on EVERY request before your routes
app.use(cors());            // Allow requests from other origins
app.use(express.json());   // Parse JSON request bodies

// Helper: Read all tasks from the JSON file
async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];  // If file doesn't exist, return empty array
  }
}

// Helper: Write tasks array to the JSON file
async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// GET /tasks — Return all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// GET /tasks/:id — Return a single task by ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tasks = await readTasks();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read task' });
  }
});

// POST /tasks — Create a new task
app.post('/tasks', async (req, res) => {
  try {
    const { text } = req.body;

    // Validate: text is required
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const newTask = {
      id: Date.now(),                         // Unique ID from timestamp
      text,
      completed: false,
      createdAt: new Date().toISOString()     // ISO format timestamp
    };

    const tasks = await readTasks();
    tasks.push(newTask);
    await writeTasks(tasks);

    res.status(201).json(newTask);            // 201 = Created
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /tasks/:id — Update an existing task
app.put('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tasks = await readTasks();
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Merge existing task with updates, preserve original id
    tasks[index] = { ...tasks[index], ...req.body, id };
    await writeTasks(tasks);

    res.json(tasks[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /tasks/:id — Remove a task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tasks = await readTasks();
    const filtered = tasks.filter(t => t.id !== id);

    if (filtered.length === tasks.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await writeTasks(filtered);
    res.sendStatus(204);   // 204 = No Content (success, no body)
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});