import { NextRequest, NextResponse } from 'next/server';
import { getProps, addProp, updateProp, deleteProp } from '@/lib/storage';

export async function GET() {
  try {
    const props = getProps();
    return NextResponse.json(props);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch props' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProp = addProp(body);
    return NextResponse.json(newProp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create prop' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const updatedProp = updateProp(id, updates);
    if (!updatedProp) {
      return NextResponse.json({ error: 'Prop not found' }, { status: 404 });
    }
    return NextResponse.json(updatedProp);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update prop' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const deleted = deleteProp(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Prop not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prop' }, { status: 500 });
  }
}
