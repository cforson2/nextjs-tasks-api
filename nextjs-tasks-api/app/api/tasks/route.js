// app/api/tasks/route.js
import { NextResponse } from 'next/server';
import { readTasks, writeTasks } from '@/lib/tasks';

// GET /api/tasks — Return all tasks
export async function GET() {
  const tasks = await readTasks();
  return NextResponse.json(tasks);
}

// POST /api/tasks — Create a new task
export async function POST(request) {
  const { text } = await request.json();

  if (!text) {
    return NextResponse.json(
      { error: 'Text is required' },
      { status: 400 }
    );
  }

  const newTask = {
    id: Date.now(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  const tasks = await readTasks();
  tasks.push(newTask);
  await writeTasks(tasks);

  return NextResponse.json(newTask, { status: 201 });
}