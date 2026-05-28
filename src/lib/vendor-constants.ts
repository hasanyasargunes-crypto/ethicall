export const VENDOR_STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string }> = {
  ACTIVE: { label: "Aktif", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  PENDING: { label: "Beklemede", dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  INACTIVE: { label: "Pasif", dot: "bg-gray-400", bg: "bg-gray-100 text-gray-600" },
  BLOCKED: { label: "Engelli", dot: "bg-red-500", bg: "bg-red-50 text-red-700" },
};

export const RISK_LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  LOW: { label: "Düşük Risk", color: "text-emerald-600", bg: "bg-emerald-50 text-emerald-700", icon: "shield-check" },
  MEDIUM: { label: "Orta Risk", color: "text-amber-600", bg: "bg-amber-50 text-amber-700", icon: "shield-alert" },
  HIGH: { label: "Yüksek Risk", color: "text-orange-600", bg: "bg-orange-50 text-orange-700", icon: "shield-x" },
  CRITICAL: { label: "Kritik Risk", color: "text-red-600", bg: "bg-red-50 text-red-700", icon: "shield-off" },
};

export const SURVEY_STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string }> = {
  DRAFT: { label: "Taslak", dot: "bg-gray-400", bg: "bg-gray-100 text-gray-600" },
  SENT: { label: "Gönderildi", dot: "bg-blue-500", bg: "bg-blue-50 text-blue-700" },
  IN_PROGRESS: { label: "Devam Ediyor", dot: "bg-purple-500", bg: "bg-purple-50 text-purple-700" },
  COMPLETED: { label: "Tamamlandı", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  EXPIRED: { label: "Süresi Doldu", dot: "bg-red-400", bg: "bg-red-50 text-red-600" },
};

export const VENDOR_KANBAN_COLUMNS = [
  { key: "ACTIVE", label: "Aktif", dotColor: "bg-emerald-500", bgColor: "bg-emerald-50" },
  { key: "PENDING", label: "Beklemede", dotColor: "bg-amber-500", bgColor: "bg-amber-50" },
  { key: "INACTIVE", label: "Pasif", dotColor: "bg-gray-400", bgColor: "bg-gray-100" },
  { key: "BLOCKED", label: "Engelli", dotColor: "bg-red-500", bgColor: "bg-red-50" },
];

export const DOCUMENT_TYPES = [
  { value: "ISO_27001", label: "ISO 27001 - Bilgi Güvenliği" },
  { value: "ISO_9001", label: "ISO 9001 - Kalite Yönetimi" },
  { value: "ISO_14001", label: "ISO 14001 - Çevre Yönetimi" },
  { value: "ISO_45001", label: "ISO 45001 - İş Sağlığı ve Güvenliği" },
  { value: "KVKK_COMPLIANCE", label: "KVKK Uyum Belgesi" },
  { value: "GDPR_COMPLIANCE", label: "GDPR Uyum Belgesi" },
  { value: "TRADE_REGISTRY", label: "Ticaret Sicil Gazetesi" },
  { value: "TAX_CERTIFICATE", label: "Vergi Levhası" },
  { value: "ACTIVITY_CERTIFICATE", label: "Faaliyet Belgesi" },
  { value: "INSURANCE", label: "Sigorta Poliçesi" },
  { value: "OTHER", label: "Diğer" },
];

export const SECTOR_OPTIONS = [
  "Teknoloji",
  "Lojistik",
  "Üretim",
  "Finans",
  "Sağlık",
  "İnşaat",
  "Enerji",
  "Perakende",
  "Gıda",
  "Danışmanlık",
  "Hukuk",
  "Eğitim",
  "Medya",
  "Diğer",
];

// Default KVKK & Information Security survey template
export const DEFAULT_SURVEY_QUESTIONS = [
  {
    id: "q1",
    text_tr: "Şirketinizde KVKK kapsamında bir Veri Sorumlusu atanmış mıdır?",
    text_en: "Has a Data Controller been appointed under KVKK in your company?",
    type: "yes_no",
    weight: 8,
    category: "kvkk",
  },
  {
    id: "q2",
    text_tr: "VERBİS (Veri Sorumluları Sicili) kaydını tamamladınız mı?",
    text_en: "Have you completed VERBIS registration?",
    type: "yes_no",
    weight: 10,
    category: "kvkk",
  },
  {
    id: "q3",
    text_tr: "Kişisel veri envanteriniz mevcut mu ve güncel mi?",
    text_en: "Do you have a personal data inventory and is it up to date?",
    type: "yes_no",
    weight: 8,
    category: "kvkk",
  },
  {
    id: "q4",
    text_tr: "Çalışan ve üçüncü taraflar için kişisel verilerin korunmasına ilişkin aydınlatma metniniz var mı?",
    text_en: "Do you have a privacy notice for employees and third parties?",
    type: "yes_no",
    weight: 7,
    category: "kvkk",
  },
  {
    id: "q5",
    text_tr: "Kişisel veri işleme faaliyetleriniz için açık rıza süreçleri tanımlı mı?",
    text_en: "Are explicit consent processes defined for personal data processing?",
    type: "yes_no",
    weight: 7,
    category: "kvkk",
  },
  {
    id: "q6",
    text_tr: "Bilgi güvenliği politikanız yazılı olarak mevcut mu?",
    text_en: "Do you have a written information security policy?",
    type: "yes_no",
    weight: 9,
    category: "security",
  },
  {
    id: "q7",
    text_tr: "ISO 27001 veya benzeri bir bilgi güvenliği sertifikanız var mı?",
    text_en: "Do you have ISO 27001 or similar information security certification?",
    type: "select",
    options: [
      { value: "certified", label_tr: "Evet, sertifikalıyız", label_en: "Yes, certified", score: 100 },
      { value: "in_progress", label_tr: "Süreçte", label_en: "In progress", score: 60 },
      { value: "planned", label_tr: "Planlanmakta", label_en: "Planned", score: 30 },
      { value: "no", label_tr: "Hayır", label_en: "No", score: 0 },
    ],
    weight: 10,
    category: "security",
  },
  {
    id: "q8",
    text_tr: "Çalışanlarınıza bilgi güvenliği farkındalık eğitimi veriliyor mu?",
    text_en: "Do you provide information security awareness training?",
    type: "select",
    options: [
      { value: "regular", label_tr: "Düzenli eğitimler", label_en: "Regular training", score: 100 },
      { value: "annual", label_tr: "Yıllık", label_en: "Annual", score: 70 },
      { value: "once", label_tr: "Sadece işe girişte", label_en: "Only at onboarding", score: 30 },
      { value: "no", label_tr: "Hayır", label_en: "No", score: 0 },
    ],
    weight: 7,
    category: "security",
  },
  {
    id: "q9",
    text_tr: "Veri ihlali durumunda bir olay müdahale planınız var mı?",
    text_en: "Do you have an incident response plan for data breaches?",
    type: "yes_no",
    weight: 9,
    category: "security",
  },
  {
    id: "q10",
    text_tr: "Üçüncü taraf erişim kontrolleri ve yetki yönetimi uyguluyor musunuz?",
    text_en: "Do you apply third-party access controls and authorization management?",
    type: "yes_no",
    weight: 7,
    category: "security",
  },
  {
    id: "q11",
    text_tr: "Felaket kurtarma (disaster recovery) planınız mevcut mu?",
    text_en: "Do you have a disaster recovery plan?",
    type: "yes_no",
    weight: 8,
    category: "continuity",
  },
  {
    id: "q12",
    text_tr: "Düzenli yedekleme ve geri yükleme testleri yapıyor musunuz?",
    text_en: "Do you perform regular backup and restore tests?",
    type: "yes_no",
    weight: 7,
    category: "continuity",
  },
  {
    id: "q13",
    text_tr: "Rüşvet ve yolsuzlukla mücadele politikanız var mı?",
    text_en: "Do you have an anti-bribery and anti-corruption policy?",
    type: "yes_no",
    weight: 6,
    category: "ethics",
  },
  {
    id: "q14",
    text_tr: "Şirketinizde bir etik ihbar kanalı mevcut mu?",
    text_en: "Does your company have a whistleblowing channel?",
    type: "yes_no",
    weight: 5,
    category: "ethics",
  },
  {
    id: "q15",
    text_tr: "Çevre ve sürdürülebilirlik politikanız var mı?",
    text_en: "Do you have an environmental and sustainability policy?",
    type: "yes_no",
    weight: 4,
    category: "esg",
  },
];

export function calculateRiskScore(questions: any[], responses: Record<string, any>): { score: number; level: string } {
  let totalWeight = 0;
  let earnedScore = 0;

  for (const q of questions) {
    totalWeight += q.weight;
    const answer = responses[q.id];
    if (!answer) continue;

    if (q.type === "yes_no") {
      if (answer === "yes" || answer === true) {
        earnedScore += q.weight;
      }
    } else if (q.type === "select") {
      const option = q.options?.find((o: any) => o.value === answer);
      if (option) {
        earnedScore += (option.score / 100) * q.weight;
      }
    }
  }

  const score = totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 0;

  let level: string;
  if (score >= 80) level = "LOW";
  else if (score >= 60) level = "MEDIUM";
  else if (score >= 40) level = "HIGH";
  else level = "CRITICAL";

  return { score, level };
}
