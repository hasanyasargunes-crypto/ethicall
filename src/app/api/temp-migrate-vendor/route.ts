import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (token !== "vendor-migrate-2024-sec") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // 1. Add VENDOR_COMPLIANCE to Product enum if not exists
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "Product" ADD VALUE IF NOT EXISTS 'VENDOR_COMPLIANCE'`);
      results.push("Added VENDOR_COMPLIANCE to Product enum");
    } catch (e: any) {
      results.push("Product enum: " + e.message);
    }

    // 2. Create VendorStatus enum
    try {
      await prisma.$executeRawUnsafe(`CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING')`);
      results.push("Created VendorStatus enum");
    } catch (e: any) {
      results.push("VendorStatus enum: " + e.message);
    }

    // 3. Create RiskLevel enum
    try {
      await prisma.$executeRawUnsafe(`CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`);
      results.push("Created RiskLevel enum");
    } catch (e: any) {
      results.push("RiskLevel enum: " + e.message);
    }

    // 4. Create SurveyStatus enum
    try {
      await prisma.$executeRawUnsafe(`CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT', 'SENT', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED')`);
      results.push("Created SurveyStatus enum");
    } catch (e: any) {
      results.push("SurveyStatus enum: " + e.message);
    }

    // 5. Create Vendor table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Vendor" (
          "id" TEXT NOT NULL,
          "organizationId" TEXT NOT NULL,
          "companyName" TEXT NOT NULL,
          "taxId" TEXT,
          "contactName" TEXT NOT NULL,
          "contactEmail" TEXT NOT NULL,
          "contactPhone" TEXT,
          "address" TEXT,
          "sector" TEXT,
          "notes" TEXT,
          "status" "VendorStatus" NOT NULL DEFAULT 'ACTIVE',
          "overallRiskScore" DOUBLE PRECISION,
          "riskLevel" "RiskLevel",
          "portalToken" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("Created Vendor table");
    } catch (e: any) {
      results.push("Vendor table: " + e.message);
    }

    // 6. Create ComplianceSurveyTemplate table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ComplianceSurveyTemplate" (
          "id" TEXT NOT NULL,
          "organizationId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "questions" JSONB NOT NULL DEFAULT '[]',
          "isDefault" BOOLEAN NOT NULL DEFAULT false,
          "category" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ComplianceSurveyTemplate_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("Created ComplianceSurveyTemplate table");
    } catch (e: any) {
      results.push("ComplianceSurveyTemplate table: " + e.message);
    }

    // 7. Create ComplianceSurvey table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ComplianceSurvey" (
          "id" TEXT NOT NULL,
          "vendorId" TEXT NOT NULL,
          "templateId" TEXT NOT NULL,
          "status" "SurveyStatus" NOT NULL DEFAULT 'SENT',
          "accessToken" TEXT NOT NULL,
          "responses" JSONB,
          "riskScore" DOUBLE PRECISION,
          "riskLevel" "RiskLevel",
          "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "startedAt" TIMESTAMP(3),
          "completedAt" TIMESTAMP(3),
          "expiresAt" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "ComplianceSurvey_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("Created ComplianceSurvey table");
    } catch (e: any) {
      results.push("ComplianceSurvey table: " + e.message);
    }

    // 8. Create VendorDocument table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "VendorDocument" (
          "id" TEXT NOT NULL,
          "vendorId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileUrl" TEXT NOT NULL,
          "fileSize" INTEGER NOT NULL,
          "mimeType" TEXT NOT NULL,
          "documentType" TEXT NOT NULL,
          "issueDate" TIMESTAMP(3),
          "expiryDate" TIMESTAMP(3),
          "expiryWarning90" BOOLEAN NOT NULL DEFAULT false,
          "expiryWarning30" BOOLEAN NOT NULL DEFAULT false,
          "expiryWarning7" BOOLEAN NOT NULL DEFAULT false,
          "uploadedBy" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "VendorDocument_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("Created VendorDocument table");
    } catch (e: any) {
      results.push("VendorDocument table: " + e.message);
    }

    // 9. Create VendorAuditLog table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "VendorAuditLog" (
          "id" TEXT NOT NULL,
          "vendorId" TEXT,
          "userId" TEXT,
          "action" TEXT NOT NULL,
          "details" JSONB,
          "ipAddress" TEXT,
          "organizationId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "VendorAuditLog_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("Created VendorAuditLog table");
    } catch (e: any) {
      results.push("VendorAuditLog table: " + e.message);
    }

    // 10. Create unique constraints
    try {
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Vendor_portalToken_key" ON "Vendor"("portalToken")`);
      results.push("Created Vendor_portalToken_key unique index");
    } catch (e: any) {
      results.push("Vendor_portalToken unique: " + e.message);
    }

    try {
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ComplianceSurvey_accessToken_key" ON "ComplianceSurvey"("accessToken")`);
      results.push("Created ComplianceSurvey_accessToken_key unique index");
    } catch (e: any) {
      results.push("ComplianceSurvey_accessToken unique: " + e.message);
    }

    // 11. Create indexes
    const indexes = [
      [`CREATE INDEX IF NOT EXISTS "Vendor_organizationId_status_idx" ON "Vendor"("organizationId", "status")`, "Vendor org+status index"],
      [`CREATE INDEX IF NOT EXISTS "Vendor_portalToken_idx" ON "Vendor"("portalToken")`, "Vendor portalToken index"],
      [`CREATE INDEX IF NOT EXISTS "ComplianceSurvey_vendorId_idx" ON "ComplianceSurvey"("vendorId")`, "ComplianceSurvey vendorId index"],
      [`CREATE INDEX IF NOT EXISTS "ComplianceSurvey_accessToken_idx" ON "ComplianceSurvey"("accessToken")`, "ComplianceSurvey accessToken index"],
      [`CREATE INDEX IF NOT EXISTS "VendorDocument_vendorId_idx" ON "VendorDocument"("vendorId")`, "VendorDocument vendorId index"],
      [`CREATE INDEX IF NOT EXISTS "VendorDocument_expiryDate_idx" ON "VendorDocument"("expiryDate")`, "VendorDocument expiryDate index"],
      [`CREATE INDEX IF NOT EXISTS "VendorAuditLog_vendorId_idx" ON "VendorAuditLog"("vendorId")`, "VendorAuditLog vendorId index"],
      [`CREATE INDEX IF NOT EXISTS "VendorAuditLog_organizationId_idx" ON "VendorAuditLog"("organizationId")`, "VendorAuditLog organizationId index"],
    ];

    for (const [sql, label] of indexes) {
      try {
        await prisma.$executeRawUnsafe(sql);
        results.push("Created " + label);
      } catch (e: any) {
        results.push(label + ": " + e.message);
      }
    }

    // 12. Create foreign keys
    const fks = [
      [`ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE`, "Vendor->Organization FK"],
      [`ALTER TABLE "ComplianceSurveyTemplate" ADD CONSTRAINT "ComplianceSurveyTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE`, "ComplianceSurveyTemplate->Organization FK"],
      [`ALTER TABLE "ComplianceSurvey" ADD CONSTRAINT "ComplianceSurvey_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE`, "ComplianceSurvey->Vendor FK"],
      [`ALTER TABLE "ComplianceSurvey" ADD CONSTRAINT "ComplianceSurvey_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ComplianceSurveyTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE`, "ComplianceSurvey->Template FK"],
      [`ALTER TABLE "VendorDocument" ADD CONSTRAINT "VendorDocument_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE`, "VendorDocument->Vendor FK"],
      [`ALTER TABLE "VendorAuditLog" ADD CONSTRAINT "VendorAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE`, "VendorAuditLog->User FK"],
      [`ALTER TABLE "VendorAuditLog" ADD CONSTRAINT "VendorAuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE`, "VendorAuditLog->Organization FK"],
    ];

    for (const [sql, label] of fks) {
      try {
        await prisma.$executeRawUnsafe(sql);
        results.push("Created " + label);
      } catch (e: any) {
        results.push(label + ": " + e.message);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, results }, { status: 500 });
  }
}
