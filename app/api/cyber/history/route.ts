import { NextRequest, NextResponse } from 'next/server';
import { cybersecurityStorage } from '@/lib/cybersecurity/storage';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const inv = cybersecurityStorage.get(id);
    if (!inv) {
      return NextResponse.json({ success: false, error: 'Investigation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, investigation: inv });
  }

  const all = cybersecurityStorage.getAll();
  return NextResponse.json({ success: true, investigations: all });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
  }

  const deleted = cybersecurityStorage.delete(id);
  return NextResponse.json({ success: deleted });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, title } = body;
  if (!id || !title) {
    return NextResponse.json({ success: false, error: 'Missing id or title' }, { status: 400 });
  }

  const renamed = cybersecurityStorage.rename(id, title);
  return NextResponse.json({ success: renamed });
}
