"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Send,
  AlertTriangle,
} from "lucide-react";
import { DATA_REQUEST_STATUS_CONFIG, KVKK_RIGHT_LABELS, RESPONSE_TYPE_LABELS } from "@/lib/kvkk-constants";

type DataRequest = {
  id: string;
  trackingCode: string;
  applicantName: string;
  applicantSurname: string;
  applicantTCKN: string | null;
  applicantPassport: string | null;
  applicantNationality: string | null;
  applicantAddress: string;
  applicantEmail: string | null;
  applicantPhone: string | null;
  applicantFax: string | null;
  isProxy: boolean;
  proxyName: string | null;
  rightType: string;
  subject: string;
  description: string;
  status: string;
  responseContent: string | null;
  responseType: string | null;
  responseDate: string | null;
  slaDeadline: string;
  pageCount: number | null;
  feeAmount: number | null;
  assignedTo: { id: string; name: string } | null;
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
    details: Record<string, unknown> | null;
    user: { name: string } | null;
    createdAt: string;
  }[];
};

export default function KVKKApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<DataRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [responseType, setResponseType] = useState("");
  const [responseContent, setResponseContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch(`/api/kvkk/applications/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setStatusUpdate(d.status);
        setResponseType(d.responseType || "");
        setResponseContent(d.responseContent || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/team/members")
      .then((r) => r.json())
      .then((members) => {
        if (Array.isArray(members)) setTeamMembers(members);
      })
      .catch(() => {});
  }, [id]);

  async function handleUpdate() {
    if (!data) return;
    setSaving(true);
    const res = await fetch(`/api/kvkk/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: statusUpdate,
        responseType: responseType || undefined,
        responseContent: responseContent || undefined,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setData({ ...data, ...updated });
    }
    setSaving(false);
  }

  async function handleAssign(userId: string) {
    if (!data) return;
    const res = await fetch(`/api/kvkk/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToId: userId || null }),
    });
    if (res.ok) {
      const member = teamMembers.find((m) => m.id === userId);
      setData({ ...data, assignedTo: member ? { id: member.id, name: member.name } : null });
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    const res = await fetch(`/api/kvkk/applications/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage }),
    });
    if (res.ok) {
      const msg = await res.json();
      setData((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
      setNewMessage("");
    }
    setSendingMessage(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-16 text-gray-400">Başvuru bulunamadı</div>;
  }

  const isOverdue = new Date(data.slaDeadline) < new Date() && !["COMPLETED", "REJECTED"].includes(data.status);
  const daysLeft = Math.ceil((new Date(data.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <Link href="/dashboard/kvkk/applications" className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Başvurulara Dön
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="page-header">{data.trackingCode}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${DATA_REQUEST_STATUS_CONFIG[data.status]?.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${DATA_REQUEST_STATUS_CONFIG[data.status]?.dot}`} />
              {DATA_REQUEST_STATUS_CONFIG[data.status]?.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">{data.subject}</p>
        </div>
        <div className="flex items-center gap-2">
          {isOverdue && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-[12px] font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" /> SLA Aşıldı
            </span>
          )}
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium ${isOverdue ? "bg-red-50 text-red-600" : daysLeft <= 7 ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-600"}`}>
            <Clock className="h-3.5 w-3.5" />
            {isOverdue ? "Süre doldu" : `${daysLeft} gün kaldı`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Applicant Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="section-title mb-4">Başvuran Bilgileri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-[11px] text-gray-400">Ad Soyad</p>
                  <p className="text-[13px] font-medium text-gray-900">{data.applicantName} {data.applicantSurname}</p>
                </div>
              </div>
              {data.applicantTCKN && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-gray-400">T.C. Kimlik No</p>
                    <p className="text-[13px] font-medium text-gray-900">{data.applicantTCKN}</p>
                  </div>
                </div>
              )}
              {data.applicantEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-gray-400">E-posta</p>
                    <p className="text-[13px] font-medium text-gray-900">{data.applicantEmail}</p>
                  </div>
                </div>
              )}
              {data.applicantPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-gray-400">Telefon</p>
                    <p className="text-[13px] font-medium text-gray-900">{data.applicantPhone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-[11px] text-gray-400">Adres</p>
                  <p className="text-[13px] text-gray-900">{data.applicantAddress}</p>
                </div>
              </div>
              {data.isProxy && data.proxyName && (
                <div className="sm:col-span-2 bg-amber-50 rounded-lg p-3">
                  <p className="text-[12px] font-medium text-amber-700">Vekil Başvurusu: {data.proxyName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="section-title mb-4">Başvuru Detayı</h3>
            <div className="mb-3">
              <p className="text-[11px] text-gray-400 mb-1">Talep Edilen Hak</p>
              <p className="text-[13px] font-medium text-brand-700 bg-brand-50 inline-block px-3 py-1.5 rounded-lg">
                {KVKK_RIGHT_LABELS[data.rightType]?.tr || data.rightType}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 mb-1">Açıklama</p>
              <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{data.description}</p>
            </div>
          </div>

          {/* Response */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="section-title mb-4">Cevap</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Cevap Türü</label>
                  <select
                    value={responseType}
                    onChange={(e) => setResponseType(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="">Seçin...</option>
                    {Object.entries(RESPONSE_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Durum Güncelle</label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {Object.entries(DATA_REQUEST_STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Cevap Metni</label>
                <textarea
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  rows={5}
                  placeholder="Başvurana verilecek cevabı yazın..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="section-title mb-4">Mesajlar</h3>
            <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
              {data.messages.length === 0 ? (
                <p className="text-[13px] text-gray-400 text-center py-6">Henüz mesaj yok</p>
              ) : (
                data.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${msg.senderType === "STAFF" ? "bg-brand-50 ml-8" : "bg-gray-50 mr-8"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-gray-600">
                        {msg.senderType === "STAFF" ? msg.sender?.name || "Ekip" : "Başvuran"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.createdAt).toLocaleString("tr-TR")}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-800">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesaj yazın..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
                className="px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-5">
          {/* Assignment */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-[13px] font-semibold text-gray-700 mb-3">Atama</h4>
            <select
              value={data.assignedTo?.id || ""}
              onChange={(e) => handleAssign(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Atanmamış</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-[13px] font-semibold text-gray-700 mb-3">Zaman Çizelgesi</h4>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-gray-400">Oluşturulma</p>
                <p className="text-[13px] text-gray-700">{new Date(data.createdAt).toLocaleString("tr-TR")}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">SLA Son Tarih</p>
                <p className={`text-[13px] font-medium ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
                  {new Date(data.slaDeadline).toLocaleDateString("tr-TR")}
                </p>
              </div>
              {data.responseDate && (
                <div>
                  <p className="text-[11px] text-gray-400">Cevap Tarihi</p>
                  <p className="text-[13px] text-gray-700">{new Date(data.responseDate).toLocaleString("tr-TR")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Fee Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-[13px] font-semibold text-gray-700 mb-3">Ücret Bilgisi</h4>
            <p className="text-[12px] text-gray-500">
              KVKK&apos;ya göre 10 sayfaya kadar ücretsiz, her ek sayfa 1 TL.
            </p>
            {data.feeAmount && data.feeAmount > 0 && (
              <p className="text-[14px] font-semibold text-gray-900 mt-2">{data.feeAmount} TL</p>
            )}
          </div>

          {/* Audit Log */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-[13px] font-semibold text-gray-700 mb-3">İşlem Geçmişi</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.auditLogs.map((log) => (
                <div key={log.id} className="border-l-2 border-gray-100 pl-3 py-1">
                  <p className="text-[12px] text-gray-700">{log.action.replace(/_/g, " ").replace(/\./g, " → ")}</p>
                  <p className="text-[10px] text-gray-400">
                    {log.user?.name || "Sistem"} · {new Date(log.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
