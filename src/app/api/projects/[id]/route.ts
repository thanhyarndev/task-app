import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Project } from '@/models/Project';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/projects/[id]
export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();
    const project = await Project.findOne({ id: params.id });
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    await connectDB();
    const project = await Project.findOneAndUpdate(
      { id: params.id },
      { ...body, updatedAt: new Date() },
      { new: true }
    );
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const project = await Project.findOneAndDelete({ id: params.id });
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 