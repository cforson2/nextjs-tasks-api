// app/api/tasks/[id]/route.js
import { NextResponse } from 'next/server';
import { readTasks, writeTasks } from '@/lib/tasks';

// GET /api/tasks/[id] — Return a single task
export async function GET(request, { params }) {
  const { id } = await params;
  const parsedId = parseInt(id);
  const tasks = await readTasks();
  const task = tasks.find(t => t.id === parsedId);

  if (!task) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}

// PUT /api/tasks/[id] — Update a task
export async function PUT(request, { params }) {
  const { id } = await params;
  const parsedId = parseInt(id);
  const updates = await request.json();
  const tasks = await readTasks();
  const index = tasks.findIndex(t => t.id === parsedId);

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  tasks[index] = { ...tasks[index], ...updates, id: parsedId };
  await writeTasks(tasks);
  return NextResponse.json(tasks[index]);
}

// DELETE /api/tasks/[id] — Remove a task
export async function DELETE(request, { params }) {
  const { id } = await params;
  const parsedId = parseInt(id);
  const tasks = await readTasks();
  const filtered = tasks.filter(t => t.id !== parsedId);

  if (filtered.length === tasks.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await writeTasks(filtered);
  return new Response(null, { status: 204 });
}