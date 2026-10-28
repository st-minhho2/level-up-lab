import { NextResponse } from 'next/server';
import { healthReport } from '@/lib/health';

// Route Handler (GET only). Reads: no auth, no DB. Mutations never live under app/api; they are Server Actions.
export function GET(): NextResponse {
  return NextResponse.json(healthReport(process.uptime()));
}
