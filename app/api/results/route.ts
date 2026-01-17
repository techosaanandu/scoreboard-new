import { NextRequest, NextResponse } from 'next/server';
import Result from '@/models/Result';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    
    await dbConnect();

    let query: Record<string, unknown> = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      query = {
        $or: [
          { studentName: regex },
          { chestNo: regex },
          { school: regex },
          { eventName: regex }
        ]
      };
    } else {
        // If no query, return recent or empty?
        // Let's return recent 50 for "browsing"
    }

    const data = await Result.find(query).sort({ updatedAt: -1 }).limit(100);

    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
