import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const org = await prisma.organization.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Şirket",
      slug: "demo",
      domain: "demo.ethicall.com",
      primaryColor: "#1a56db",
      plan: "TRIAL",
    },
  });

  await prisma.user.upsert({
    where: { email_organizationId: { email: "admin@demo.ethicall.com", organizationId: org.id } },
    update: {},
    create: {
      email: "admin@demo.ethicall.com",
      name: "Demo Admin",
      passwordHash,
      role: "ADMIN",
      organizationId: org.id,
    },
  });

  const categories = [
    { name_tr: "Finansal Suistimal", name_en: "Financial Fraud", icon: "Banknote", sortOrder: 0 },
    { name_tr: "Yolsuzluk ve Rüşvet", name_en: "Corruption & Bribery", icon: "Scale", sortOrder: 1 },
    { name_tr: "İş Sağlığı ve Güvenliği", name_en: "Workplace Safety", icon: "HardHat", sortOrder: 2 },
    { name_tr: "Ayrımcılık ve Taciz", name_en: "Discrimination & Harassment", icon: "ShieldAlert", sortOrder: 3 },
    { name_tr: "Çıkar Çatışması", name_en: "Conflict of Interest", icon: "Swords", sortOrder: 4 },
    { name_tr: "Veri Gizliliği İhlali", name_en: "Data Privacy Breach", icon: "Lock", sortOrder: 5 },
    { name_tr: "Çevresel İhlal", name_en: "Environmental Violation", icon: "TreePine", sortOrder: 6 },
    { name_tr: "Diğer", name_en: "Other", icon: "MoreHorizontal", sortOrder: 7 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: `seed-${cat.sortOrder}` },
      update: {},
      create: {
        id: `seed-${cat.sortOrder}`,
        ...cat,
        organizationId: org.id,
      },
    });
  }

  const now = new Date();
  const sampleReports = [
    {
      trackingCode: "ETH-DEMO0001",
      reporterEmail: "reporter1@demo.ethicall.com",
      reporterEmailVerified: true,
      categoryId: "seed-0",
      title: "Şüpheli fatura işlemleri",
      description: "Son 3 ayda muhasebe departmanında şüpheli fatura işlemleri tespit ettim.",
      severity: "HIGH" as const,
      status: "NEW" as const,
      priority: "HIGH" as const,
      organizationId: org.id,
      slaAckDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      slaResDeadline: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      trackingCode: "ETH-DEMO0002",
      reporterEmail: "reporter2@demo.ethicall.com",
      reporterEmailVerified: true,
      categoryId: "seed-3",
      title: "İşyerinde ayrımcılık uygulaması",
      description: "Departmanımızda belirli çalışanlara sistematik olarak ayrımcılık uygulandığını gözlemliyorum.",
      severity: "MEDIUM" as const,
      status: "ACKNOWLEDGED" as const,
      priority: "MEDIUM" as const,
      organizationId: org.id,
      acknowledgedAt: new Date(),
      slaAckDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      slaResDeadline: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      trackingCode: "ETH-DEMO0003",
      reporterEmail: "reporter3@demo.ethicall.com",
      reporterEmailVerified: true,
      categoryId: "seed-5",
      title: "Müşteri verilerinin yetkisiz paylaşımı",
      description: "Müşteri verilerinin üçüncü taraflarla izinsiz paylaşıldığını fark ettim.",
      severity: "CRITICAL" as const,
      status: "INVESTIGATING" as const,
      priority: "URGENT" as const,
      organizationId: org.id,
      acknowledgedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      slaAckDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      slaResDeadline: new Date(now.getTime() + 88 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const report of sampleReports) {
    await prisma.report.upsert({
      where: { trackingCode: report.trackingCode },
      update: {},
      create: report,
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
