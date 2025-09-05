import { NextResponse } from 'next/server';
import { requireDriver } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await requireDriver();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: (session.user as any).id,
      email: session.user?.email,
      name: session.user?.name,
      role: (session.user as any).role,
    },
  });
}
