import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/models/Task';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/projects/[id]/tasks
export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();
    const tasks = await Task.find({ projectId: params.id }).sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/tasks
export async function POST(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    await connectDB();
    const task = await Task.create({
      ...body,
      projectId: params.id
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 