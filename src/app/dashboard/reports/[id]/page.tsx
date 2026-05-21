"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Clock, User, Activity } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "NEW", label: "Yeni" },
  { value: "ACKNOWLEDGED", label: "Onaylandı" },
  { value: "UNDER_REVIEW", label: "İnceleniyor" },
  { value: "INVESTIGATING", label: "Soruşturuluyor" },
  { value: "RESOLVED", label: "Çözüldü" },
  { value: "CLOSED", label: "Kapatıldı" },
  { value: "DISMISSED", label: "Reddedildi" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Düşük" },
  { value: "MEDIUM", label: "Orta" },
  { value: "HIGH", label: "Yüksek" },
  { value: "URGENT", label: "Acil" },
];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  ACKNOWLEDGED: "bg-amber-50 text-amber-700",
  UNDER_REVIEW: "bg-purple-50 text-purple-700",
  INVESTIGATING: "bg-orange-50 text-orange-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-gray-100 text-gray-600",
  DISMISSED: "bg-red-50 text-red-600",
};

const STATUS_DOTS: Record<string, string> = {
  NEW: "bg-blue-500",
  ACKNOWLEDGED: "bg-amber-500",
  UNDER_REVIEW: "bg-purple-500",
  INVESTIGATING: "bg-orange-500",
  RESOLVED: "bg-emerald-500",
  CLOSED: "bg-gray-400",
  DISMISSED: "bg-red-400",
};

type ReportDetail = {
  id: string;
  trackingCode: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  severity: string;
  category: { name_tr: string; name_en: string };
  assignedTo: { id: string; name: string } | null;
  slaAckDeadline: string;
  slaResDeadline: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  messages: {
    id: string;
    content: string;
    senderType: string;
    sender: { name: string } | null;
    createdAt: string;
  }[];
  auditLogs: {
    id: string;
    action: string;
    details: any;
    user: { name: string } | null;
    createdAt: string;
  }[];
};

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    const res = await fetch(`/api/reports/${id}`);
    if (res.ok) {
      setReport(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    loadReport();
  }, [id]);

  async function updateReport(data: Record<string, string | null>) {
    await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    loadReport();
  }

  async function sendMessage() {
    if (!message.trim()) return;
    await fetch(`/api/reports/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
    setMessage("");
    loadReport();
  }

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const ackDaysLeft = Math.ceil(
    (new Date(report.slaAckDeadline).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );
  const resDaysLeft = Math.ceil(
    (new Date(report.slaResDeadline).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/reports"
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="page-header">{report.title}</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                STATUS_COLORS[report.status]
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  STATUS_DOTS[report.status]
                }`}
              />
              {STATUS_OPTIONS.find((s) => s.value === report.status)?.label}
            </span>
          </div>
          <p className="text-[13px] text-gray-400 mt-0.5">
            <span className="font-mono text-brand-600">
              {report.trackingCode}
            </span>{" "}
            · {report.category.name_tr} ·{" "}
            {new Date(report.createdAt).toLocaleDateString("tr-TR")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="section-title">Açıklama</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-[14px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                {report.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[12px] text-gray-400">
                <User className="h-3.5 w-3.5" />
                <span>Anonim İhbarcı</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="section-title">Mesajlar</h3>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-3 mb-5 max-h-96 overflow-y-auto">
                {report.messages.length === 0 && (
                  <p className="text-gray-400 text-center py-8 text-sm">
                    Henüz mesaj yok
                  </p>
                )}
                {report.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl ${
                      msg.senderType === "REPORTER"
                        ? "bg-amber-50 mr-12"
                        : msg.senderType === "SYSTEM"
                        ? "bg-gray-50 text-center text-sm"
                        : "bg-brand-50/50 ml-12"
                    }`}
                  >
                    <p className="text-[11px] text-gray-400 mb-1.5">
                      {msg.senderType === "REPORTER"
                        ? "Anonim İhbarcı"
                        : msg.senderType === "SYSTEM"
                        ? "Sistem"
                        : msg.sender?.name || "Etik Ekip"}{" "}
                      · {new Date(msg.createdAt).toLocaleString("tr-TR")}
                    </p>
                    <p className="text-[13px] text-gray-700">{msg.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="İhbarcıya mesaj yazın..."
                  rows={2}
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="self-end p-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Management */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="section-title">Yönetim</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                  Durum
                </label>
                <select
                  value={report.status}
                  onChange={(e) => updateReport({ status: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                  Öncelik
                </label>
                <select
                  value={report.priority}
                  onChange={(e) => updateReport({ priority: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SLA */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <h3 className="section-title">SLA Durumu</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[12px] font-medium text-gray-500 mb-1">
                  Onay SLA
                </p>
                {report.acknowledgedAt ? (
                  <p className="text-[13px] text-emerald-600 font-semibold">
                    Onaylandı
                  </p>
                ) : (
                  <p
                    className={`text-[13px] font-semibold ${
                      ackDaysLeft <= 0
                        ? "text-red-500"
                        : ackDaysLeft <= 3
                        ? "text-amber-500"
                        : "text-emerald-600"
                    }`}
                  >
                    {ackDaysLeft <= 0
                      ? `${Math.abs(ackDaysLeft)} gün aşım!`
                      : `${ackDaysLeft} gün kaldı`}
                  </p>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[12px] font-medium text-gray-500 mb-1">
                  Çözüm SLA
                </p>
                {report.resolvedAt ? (
                  <p className="text-[13px] text-emerald-600 font-semibold">
                    Çözüldü
                  </p>
                ) : (
                  <p
                    className={`text-[13px] font-semibold ${
                      resDaysLeft <= 0
                        ? "text-red-500"
                        : resDaysLeft <= 30
                        ? "text-amber-500"
                        : "text-emerald-600"
                    }`}
                  >
                    {resDaysLeft <= 0
                      ? `${Math.abs(resDaysLeft)} gün aşım!`
                      : `${resDaysLeft} gün kaldı`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              <h3 className="section-title">Aktivite</h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {report.auditLogs.map((log) => (
                  <div key={log.id} className="text-[13px]">
                    <p className="text-gray-400">
                      {log.user?.name || "Sistem"} ·{" "}
                      <span className="text-gray-300">
                        {new Date(log.createdAt).toLocaleString("tr-TR")}
                      </span>
                    </p>
                    <p className="text-gray-700 mt-0.5">
                      {log.action === "report.created" && "İhbar oluşturuldu"}
                      {log.action === "status.changed" &&
                        `Durum değiştirildi: ${log.details?.from} → ${log.details?.to}`}
                      {log.action === "report.updated" && "İhbar güncellendi"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
