import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Auth tokens are disabled for this local MVP' }, { status: 404 });
}
