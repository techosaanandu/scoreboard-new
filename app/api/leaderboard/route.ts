import { NextResponse } from 'next/server';
import Result from '@/models/Result';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // Aggregate points by School
    const aggregation = await Result.aggregate([
      {
        $group: {
          _id: "$school",
          points: { $sum: "$points" }
        }
      },
      {
        $sort: { points: -1 }
      }
    ]);

    // Add rank
    let currentRank = 1;
    let data = aggregation.map((item, index) => {
       // Handle ties logic if needed, for MVP simple sequential rank:
       const rank = index + 1;
       return {
           rank,
           school: item._id,
           points: item.points
       };
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
