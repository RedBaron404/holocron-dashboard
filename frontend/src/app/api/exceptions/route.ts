import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/agent/exceptions`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
