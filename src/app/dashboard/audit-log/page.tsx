"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  ScrollText,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  Shield,
  Clock,
  Search,
} from "lucide-react";

type AuditLogEntry = {
  id: string;
  action: string;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
  report: { id: string; trackingCode: string; title: string } | null;
  user: { id: string; name: string; email: string } | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  "report.created": { label: "Ihbar Olusturuldu", color: "bg-green-50 text-green-700 border-green-200", icon: "+" },
  "report.status_changed": { label: "Durum Degistirildi", color: "bg-blue-50 text-blue-700 border-blue-200", icon: "↻" },
  "report.assigned": { label: "Atama Yapildi", color: "bg-purple-50 text-purple-700 border-purple-200", icon: "→" },
  "report.acknowledged": { label: "Onaylandi", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: "✓" },
  "report.resolved": { label: "Cozuldu", color: "bg-green-50 text-green-700 border-green-200", icon: "✓✓" },
  "report.closed": { label: "Kapatildi", color: "bg-gray-50 text-gray-700 border-gray-200", icon: "✕" },
  "message.sent": { label: "Mesaj Gonderildi", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: "✉" },
  "attachment.uploaded": { label: "Belge Yuklendi", color: "bg-orange-50 text-orange-700 border-orange-200", icon: "📎" },
  "user.login": { label: "Giris Yapildi", color: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: "🔑" },
  "user.password_changed": { label: "Sifre Degistirildi", color: "bg-red-50 text-red-700 border-red-200", icon: "🔒" },
};

function getActionInfo(action: string) {
  return ACTION_LABELS[action] || {
    label: action,
    color: "bg-gray-50 text-gray-600 border-gray-200",
    icon: "•",
  };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDetails(details: Record<string, any> | null) {
  if (!details) return null;
  return Object.entries(details)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => {
      const labels: Record<string, string> = {
        trackingCode: "Takip Kodu",
        oldStatus: "Eski Durum",
        newStatus: "Yeni Durum",
        assignedTo: "Atanan",
        fileName: "Dosya",
        fileSize: "Boyut",
        mimeType: "Tip",
      };
      const label = labels[k] || k;
      let val = String(v);
      if (k === "fileSize") {
        const bytes = Number(v);
        val = bytes < 1024 * 1024
          ? (bytes / 1024).toFixed(1) + " KB"
          : (bytes / (1024 * 1024)).toFixed(1) + " MB";
      }
      return `${label}: ${val}`;
    })
    .join(" | ");
}

export default function AuditLogPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (actionFilter) params.set("action", actionFilter);
    const res = await fetch(`/api/audit-log?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = searchQuery
    ? logs.filter(
        (log) =>
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.report?.trackingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.report?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-brand-600" />
          <h1 className="page-header">Denetim Kayitlari</h1>
        </div>
        <p className="page-subtitle">
          Tum basvuru ve islem gecmisi. Bu kayitlar degistirilemez ve silinemez.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <ScrollText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-medium text-amber-800">Degistirilemez Kayit Sistemi</p>
          <p className="text-[12px] text-amber-600 mt-0.5">
            Bu bolum tum ihbar, inceleme ve islem gecmisini kronolojik olarak gosterir.
            Kayitlar yasal uyumluluk icin korunur ve herhangi bir degisiklik yapilamaz.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Takip kodu, kullanici veya islem ara..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Tum Islemler</option>
              {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-[13px] text-gray-500">
        <span>Toplam {pagination.total} kayit</span>
        <span>|</span>
        <span>Sayfa {pagination.page} / {pagination.totalPages || 1}</span>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20">
            <ScrollText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Henuz kayit bulunmuyor.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredLogs.map((log) => {
              const info = getActionInfo(log.action);
              const details = formatDetails(log.details);
              return (
                <div key={log.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${info.color}`}
                      >
                        {info.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${info.color}`}>
                          {info.label}
                        </span>
                        {log.report && (
                          <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                            {log.report.trackingCode}
                          </span>
                        )}
                      </div>
                      {log.report?.title && (
                        <p className="text-[13px] text-gray-700 font-medium truncate">
                          {log.report.title}
                        </p>
                      )}
                      {details && (
                        <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                          {details}
                        </p>
                      )}
                    </div>

                    {/* User & Time */}
                    <div className="text-right shrink-0">
                      {log.user ? (
                        <div className="flex items-center gap-1.5 justify-end mb-0.5">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-[12px] text-gray-600 font-medium">
                            {log.user.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-end mb-0.5">
                          <Shield className="h-3 w-3 text-gray-400" />
                          <span className="text-[12px] text-gray-400">Sistem</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3 text-gray-300" />
                        <span className="text-[11px] text-gray-400">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      {log.ipAddress && (
                        <span className="text-[10px] text-gray-300">{log.ipAddress}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => fetchLogs(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Onceki
            </button>
            <span className="text-[13px] text-gray-500">
              {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
            </span>
            <button
              onClick={() => fetchLogs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sonraki <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
