import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isText = file.name.match(/\.(ts|js|py|json|txt|log|yml|yaml|md|c|cpp|go|rs|sh)$/i);
    const content = isText ? buffer.toString('utf-8') : buffer.toString('base64');

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      isBinary: !isText,
      content,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
