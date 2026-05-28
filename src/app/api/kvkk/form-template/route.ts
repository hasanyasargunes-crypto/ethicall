import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/session";
import crypto from "crypto";

export async function GET() {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const orgId = ctx.organizationId;
    const templates = await prisma.kVKKFormTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const orgId = ctx.organizationId;
    const body = await req.json();
    const { name, fields, status, description, locale } = body;

    const template = await prisma.kVKKFormTemplate.create({
      data: {
        organizationId: orgId,
        name: name || "KVKK Başvuru Formu",
        fields: fields || [],
        status: status || "DRAFT",
        description: description || null,
        locale: locale || "tr",
        publicToken: status === "LIVE" ? crypto.randomBytes(16).toString("hex") : null,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("KVKK form template creation error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const orgId = ctx.organizationId;
    const body = await req.json();
    const { id, name, fields, status, description, locale } = body;

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const existing = await prisma.kVKKFormTemplate.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Şablon bulunamadı" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (fields !== undefined) updateData.fields = fields;
    if (description !== undefined) updateData.description = description;
    if (locale !== undefined) updateData.locale = locale;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "LIVE" && !existing.publicToken) {
        updateData.publicToken = crypto.randomBytes(16).toString("hex");
      }
    }

    const updated = await prisma.kVKKFormTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("KVKK form template update error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
