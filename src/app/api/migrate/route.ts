import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Create new enums
    const enumQueries = [
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Product') THEN CREATE TYPE "Product" AS ENUM ('ETHICS', 'KVKK'); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'KVKKRight') THEN CREATE TYPE "KVKKRight" AS ENUM ('LEARN_IF_PROCESSED', 'REQUEST_INFO', 'LEARN_PURPOSE', 'LEARN_THIRD_PARTIES', 'REQUEST_CORRECTION', 'REQUEST_DELETION', 'NOTIFY_THIRD_PARTIES', 'OBJECT_AUTOMATED', 'CLAIM_DAMAGES'); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DataRequestStatus') THEN CREATE TYPE "DataRequestStatus" AS ENUM ('NEW', 'RECEIVED', 'IN_REVIEW', 'INFO_REQUESTED', 'PARTIALLY_APPROVED', 'APPROVED', 'REJECTED', 'COMPLETED'); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ResponseType') THEN CREATE TYPE "ResponseType" AS ENUM ('FULL_APPROVAL', 'PARTIAL_APPROVAL', 'REJECTION', 'INFO_REQUEST'); END IF; END $$;`,
    ];

    for (const q of enumQueries) {
      await prisma.$executeRawUnsafe(q);
      results.push("Enum created/exists");
    }

    // Add new columns to Organization
    await prisma.$executeRawUnsafe(`ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "products" "Product"[] DEFAULT ARRAY['ETHICS']::"Product"[]`);
    results.push("Added products column");

    await prisma.$executeRawUnsafe(`ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "kvkkSlaResponseDays" INTEGER NOT NULL DEFAULT 30`);
    results.push("Added kvkkSlaResponseDays column");

    // Create DataRequest table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DataRequest" (
        "id" TEXT NOT NULL,
        "trackingCode" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "applicantName" TEXT NOT NULL,
        "applicantSurname" TEXT NOT NULL,
        "applicantTCKN" TEXT,
        "applicantPassport" TEXT,
        "applicantNationality" TEXT,
        "applicantAddress" TEXT NOT NULL,
        "applicantEmail" TEXT,
        "applicantPhone" TEXT,
        "applicantFax" TEXT,
        "applicantEmailVerified" BOOLEAN NOT NULL DEFAULT false,
        "isProxy" BOOLEAN NOT NULL DEFAULT false,
        "proxyName" TEXT,
        "proxyDocument" TEXT,
        "rightType" "KVKKRight" NOT NULL,
        "subject" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "formData" JSONB,
        "status" "DataRequestStatus" NOT NULL DEFAULT 'NEW',
        "assignedToId" TEXT,
        "responseContent" TEXT,
        "responseDate" TIMESTAMP(3),
        "responseType" "ResponseType",
        "slaDeadline" TIMESTAMP(3) NOT NULL,
        "slaWarning7" BOOLEAN NOT NULL DEFAULT false,
        "slaWarning3" BOOLEAN NOT NULL DEFAULT false,
        "slaWarning1" BOOLEAN NOT NULL DEFAULT false,
        "pageCount" INTEGER,
        "feeAmount" DOUBLE PRECISION,
        "feePaid" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "DataRequest_pkey" PRIMARY KEY ("id")
      )
    `);
    results.push("Created DataRequest table");

    // Create DataRequestAttachment table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DataRequestAttachment" (
        "id" TEXT NOT NULL,
        "dataRequestId" TEXT NOT NULL,
        "fileName" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "fileSize" INTEGER NOT NULL,
        "mimeType" TEXT NOT NULL,
        "uploadedBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DataRequestAttachment_pkey" PRIMARY KEY ("id")
      )
    `);
    results.push("Created DataRequestAttachment table");

    // Create DataRequestMessage table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DataRequestMessage" (
        "id" TEXT NOT NULL,
        "dataRequestId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "senderType" "SenderType" NOT NULL,
        "senderId" TEXT,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DataRequestMessage_pkey" PRIMARY KEY ("id")
      )
    `);
    results.push("Created DataRequestMessage table");

    // Create DataRequestAuditLog table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DataRequestAuditLog" (
        "id" TEXT NOT NULL,
        "dataRequestId" TEXT,
        "userId" TEXT,
        "action" TEXT NOT NULL,
        "details" JSONB,
        "ipAddress" TEXT,
        "organizationId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DataRequestAuditLog_pkey" PRIMARY KEY ("id")
      )
    `);
    results.push("Created DataRequestAuditLog table");

    // Create KVKKFormTemplate table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "KVKKFormTemplate" (
        "id" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "name" TEXT NOT NULL DEFAULT 'KVKK Başvuru Formu',
        "fields" JSONB NOT NULL DEFAULT '[]',
        "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
        "publicToken" TEXT,
        "description" TEXT,
        "locale" TEXT NOT NULL DEFAULT 'tr',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "KVKKFormTemplate_pkey" PRIMARY KEY ("id")
      )
    `);
    results.push("Created KVKKFormTemplate table");

    // Create ResponseTemplate table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ResponseTemplate" (
        "id" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "type" "ResponseType" NOT NULL,
        "content" TEXT NOT NULL,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ResponseTemplate_pkey" PRIMARY KEY ("id")
      )
    `);
    results.push("Created ResponseTemplate table");

    // Create indexes (IF NOT EXISTS)
    const indexQueries = [
      `CREATE UNIQUE INDEX IF NOT EXISTS "DataRequest_trackingCode_key" ON "DataRequest"("trackingCode")`,
      `CREATE INDEX IF NOT EXISTS "DataRequest_organizationId_status_idx" ON "DataRequest"("organizationId", "status")`,
      `CREATE INDEX IF NOT EXISTS "DataRequest_trackingCode_idx" ON "DataRequest"("trackingCode")`,
      `CREATE INDEX IF NOT EXISTS "DataRequestAuditLog_dataRequestId_idx" ON "DataRequestAuditLog"("dataRequestId")`,
      `CREATE INDEX IF NOT EXISTS "DataRequestAuditLog_organizationId_idx" ON "DataRequestAuditLog"("organizationId")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "KVKKFormTemplate_publicToken_key" ON "KVKKFormTemplate"("publicToken")`,
    ];

    for (const q of indexQueries) {
      await prisma.$executeRawUnsafe(q);
    }
    results.push("Created indexes");

    // Create foreign keys (with IF NOT EXISTS pattern)
    const fkQueries = [
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DataRequest_organizationId_fkey') THEN ALTER TABLE "DataRequest" ADD CONSTRAINT "DataRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DataRequest_assignedToId_fkey') THEN ALTER TABLE "DataRequest" ADD CONSTRAINT "DataRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DataRequestAttachment_dataRequestId_fkey') THEN ALTER TABLE "DataRequestAttachment" ADD CONSTRAINT "DataRequestAttachment_dataRequestId_fkey" FOREIGN KEY ("dataRequestId") REFERENCES "DataRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DataRequestMessage_dataRequestId_fkey') THEN ALTER TABLE "DataRequestMessage" ADD CONSTRAINT "DataRequestMessage_dataRequestId_fkey" FOREIGN KEY ("dataRequestId") REFERENCES "DataRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DataRequestMessage_senderId_fkey') THEN ALTER TABLE "DataRequestMessage" ADD CONSTRAINT "DataRequestMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DataRequestAuditLog_dataRequestId_fkey') THEN ALTER TABLE "DataRequestAuditLog" ADD CONSTRAINT "DataRequestAuditLog_dataRequestId_fkey" FOREIGN KEY ("dataRequestId") REFERENCES "DataRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DataRequestAuditLog_userId_fkey') THEN ALTER TABLE "DataRequestAuditLog" ADD CONSTRAINT "DataRequestAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'KVKKFormTemplate_organizationId_fkey') THEN ALTER TABLE "KVKKFormTemplate" ADD CONSTRAINT "KVKKFormTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ResponseTemplate_organizationId_fkey') THEN ALTER TABLE "ResponseTemplate" ADD CONSTRAINT "ResponseTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;`,
    ];

    for (const q of fkQueries) {
      await prisma.$executeRawUnsafe(q);
    }
    results.push("Created foreign keys");

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 });
  }
}
