import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

// POST: Upload file for a report
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const reportId = formData.get("reportId") as string | null;
    const trackingCode = formData.get("trackingCode") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Dosya boyutu 10MB'yi aşamaz" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya tipi. İzin verilen: resim, PDF, Word, Excel, metin dosyaları" },
        { status: 400 }
      );
    }

    // Find report by ID or tracking code
    let report;
    if (reportId) {
      report = await prisma.report.findUnique({ where: { id: reportId } });
    } else if (trackingCode) {
      report = await prisma.report.findUnique({ where: { trackingCode } });
    }

    if (!report) {
      return NextResponse.json({ error: "İhbar bulunamadı" }, { status: 404 });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "bin";
    const uniqueName = `${randomUUID()}.${ext}`;

    // Save file to /public/uploads/
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadsDir, uniqueName);
    await writeFile(filePath, buffer);

    // Save attachment record in DB
    const attachment = await prisma.attachment.create({
      data: {
        reportId: report.id,
        fileName: file.name,
        fileUrl: `/uploads/${uniqueName}`,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: "REPORTER",
      },
    });

    // Log in audit
    await prisma.auditLog.create({
      data: {
        reportId: report.id,
        action: "attachment.uploaded",
        details: { fileName: file.name, fileSize: file.size, mimeType: file.type },
      },
    });

    return NextResponse.json({
      id: attachment.id,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      fileSize: attachment.fileSize,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Dosya yüklenirken hata oluştu" }, { status: 500 });
  }
}
