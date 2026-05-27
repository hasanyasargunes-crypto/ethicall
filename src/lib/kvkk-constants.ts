export const KVKK_RIGHT_LABELS: Record<string, { tr: string; en: string }> = {
  LEARN_IF_PROCESSED: {
    tr: "Kişisel verilerin işlenip işlenmediğini öğrenme",
    en: "Learn whether personal data is processed",
  },
  REQUEST_INFO: {
    tr: "Kişisel veriler işlenmişse buna ilişkin bilgi talep etme",
    en: "Request information if personal data has been processed",
  },
  LEARN_PURPOSE: {
    tr: "Kişisel verilerin işlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme",
    en: "Learn the purpose of processing and whether data is used accordingly",
  },
  LEARN_THIRD_PARTIES: {
    tr: "Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme",
    en: "Know the third parties to whom personal data is transferred domestically or abroad",
  },
  REQUEST_CORRECTION: {
    tr: "Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme",
    en: "Request correction of incomplete or inaccurate personal data",
  },
  REQUEST_DELETION: {
    tr: "Kişisel verilerin silinmesini veya yok edilmesini isteme",
    en: "Request deletion or destruction of personal data",
  },
  NOTIFY_THIRD_PARTIES: {
    tr: "Düzeltme/silme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
    en: "Request notification of correction/deletion to third parties to whom data was transferred",
  },
  OBJECT_AUTOMATED: {
    tr: "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme",
    en: "Object to an adverse outcome arising from automated analysis of processed data",
  },
  CLAIM_DAMAGES: {
    tr: "Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğranması hâlinde zararın giderilmesini talep etme",
    en: "Claim compensation for damages due to unlawful processing of personal data",
  },
};

export const DATA_REQUEST_STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string }> = {
  NEW: { label: "Yeni", dot: "bg-blue-500", bg: "bg-blue-50 text-blue-700" },
  RECEIVED: { label: "Alındı", dot: "bg-cyan-500", bg: "bg-cyan-50 text-cyan-700" },
  IN_REVIEW: { label: "İnceleniyor", dot: "bg-purple-500", bg: "bg-purple-50 text-purple-700" },
  INFO_REQUESTED: { label: "Ek Bilgi Bekleniyor", dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  PARTIALLY_APPROVED: { label: "Kısmen Kabul", dot: "bg-teal-500", bg: "bg-teal-50 text-teal-700" },
  APPROVED: { label: "Kabul Edildi", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  REJECTED: { label: "Reddedildi", dot: "bg-red-400", bg: "bg-red-50 text-red-600" },
  COMPLETED: { label: "Tamamlandı", dot: "bg-gray-400", bg: "bg-gray-100 text-gray-600" },
};

export const KANBAN_COLUMNS = [
  { key: "NEW", label: "Yeni", dotColor: "bg-blue-500", bgColor: "bg-blue-50" },
  { key: "RECEIVED", label: "Alındı", dotColor: "bg-cyan-500", bgColor: "bg-cyan-50" },
  { key: "IN_REVIEW", label: "İnceleniyor", dotColor: "bg-purple-500", bgColor: "bg-purple-50" },
  { key: "INFO_REQUESTED", label: "Ek Bilgi", dotColor: "bg-amber-500", bgColor: "bg-amber-50" },
  { key: "PARTIALLY_APPROVED", label: "Kısmen Kabul", dotColor: "bg-teal-500", bgColor: "bg-teal-50" },
  { key: "APPROVED", label: "Kabul", dotColor: "bg-emerald-500", bgColor: "bg-emerald-50" },
  { key: "REJECTED", label: "Ret", dotColor: "bg-red-400", bgColor: "bg-red-50" },
  { key: "COMPLETED", label: "Tamamlandı", dotColor: "bg-gray-400", bgColor: "bg-gray-100" },
];

export const REPORT_KANBAN_COLUMNS = [
  { key: "NEW", label: "Yeni", dotColor: "bg-blue-500", bgColor: "bg-blue-50" },
  { key: "ACKNOWLEDGED", label: "Onaylandı", dotColor: "bg-amber-500", bgColor: "bg-amber-50" },
  { key: "UNDER_REVIEW", label: "İnceleniyor", dotColor: "bg-purple-500", bgColor: "bg-purple-50" },
  { key: "INVESTIGATING", label: "Soruşturuluyor", dotColor: "bg-orange-500", bgColor: "bg-orange-50" },
  { key: "RESOLVED", label: "Çözüldü", dotColor: "bg-emerald-500", bgColor: "bg-emerald-50" },
  { key: "CLOSED", label: "Kapatıldı", dotColor: "bg-gray-400", bgColor: "bg-gray-100" },
  { key: "DISMISSED", label: "Reddedildi", dotColor: "bg-red-400", bgColor: "bg-red-50" },
];

export const RESPONSE_TYPE_LABELS: Record<string, string> = {
  FULL_APPROVAL: "Tam Kabul",
  PARTIAL_APPROVAL: "Kısmi Kabul",
  REJECTION: "Ret",
  INFO_REQUEST: "Ek Bilgi Talebi",
};
