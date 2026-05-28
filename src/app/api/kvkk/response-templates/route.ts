import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/session";

export async function GET() {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const orgId = ctx.organizationId;
    const templates = await prisma.responseTemplate.findMany({
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
    const { name, type, content, isDefault } = await req.json();

    if (!name || !type || !content) {
      return NextResponse.json({ error: "Tüm alanlar zorunlu" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.responseTemplate.updateMany({
        where: { organizationId: orgId, type },
        data: { isDefault: false },
      });
    }

    const template = await prisma.responseTemplate.create({
      data: {
        organizationId: orgId,
        name,
        type,
        content,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Response template creation error:", error);
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
    const { id, name, type, content, isDefault } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const existing = await prisma.responseTemplate.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Şablon bulunamadı" }, { status: 404 });
    }

    if (isDefault && type) {
      await prisma.responseTemplate.updateMany({
        where: { organizationId: orgId, type, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.responseTemplate.update({
      where: { id },
      data: { name, type, content, isDefault },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Response template update error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const orgId = ctx.organizationId;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const existing = await prisma.responseTemplate.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Şablon bulunamadı" }, { status: 404 });
    }

    await prisma.responseTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
