import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { parseAndSaveExcel } from '@/lib/excel-parser';
import { GET as authOptions } from "@/app/api/auth/[...nextauth]/route"; 

// Need to configure bodyParser to false for file upload? 
// Next.js App Router handles requests differently. We read formData.

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as any); 
  // TODO: Fix authOptions import to avoid 'any' if possible. 
  // However, getServerSession often requires the exact config object.
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    // const isGroup = formData.get('isGroup') === 'true'; // Removed unused variable as per lint error
    formData.get('isGroup'); // Consume it if needed, but it was unused.

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const result = await parseAndSaveExcel(buffer);

    return NextResponse.json({ message: "File processed successfully", data: result });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Processing failed" }, { status: 500 });
  }
}
