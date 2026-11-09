import { NextResponse } from 'next/server';
import { SessionStorage } from '@/lib/jules-engine/storage';
import { ProjectRuleInstruction } from '@/lib/jules-engine/types';

export const dynamic = 'force-dynamic';

const storage = new SessionStorage();

export async function GET() {
  const rules = storage.listRules();
  return NextResponse.json({ success: true, rules });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, content, repoUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    const rule: ProjectRuleInstruction = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      category: category || 'architecture',
      content,
      repoUrl,
      enabled: true,
      updatedAt: Date.now(),
    };

    storage.saveRule(rule);
    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'id parameter is required' }, { status: 400 });
  }
  const deleted = storage.deleteRule(id);
  return NextResponse.json({ success: deleted });
}
