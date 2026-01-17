import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { parseAndSaveExcel } from '@/lib/excel-parser';
import { authOptions } from "@/lib/auth"; 

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions); 
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const categoryNoRaw = formData.get('categoryNo');

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    if (!categoryNoRaw) {
      return NextResponse.json({ error: "Category number is required" }, { status: 400 });
    }

    const categoryNo = Number(categoryNoRaw);
    if (isNaN(categoryNo)) {
      return NextResponse.json({ error: "Invalid category number" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const result = await parseAndSaveExcel(buffer, categoryNo);

    return NextResponse.json({ message: "File processed successfully", data: result });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Processing failed" }, { status: 500 });
  }
}