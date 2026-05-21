"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Inbox } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string }> = {
  NEW: { label: "Yeni", dot: "bg-blue-500", bg: "bg-blue-50 text-blue-700" },
  ACKNOWLEDGED: { label: "Onaylandı", dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  UNDER_REVIEW: { label: "İnceleniyor", dot: "bg-purple-500", bg: "bg-purple-50 text-purple-700" },
  INVESTIGATING: { label: "Soruşturuluyor", dot: "bg-orange-500", bg: "bg-orange-50 text-orange-700" },
  RESOLVED: { label: "Çözüldü", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  CLOSED: { label: "Kapatıldı", dot: "bg-gray-400", bg: "bg-gray-100 text-gray-600" },
  DISMISSED: { label: "Reddedildi", dot: "bg-red-400", bg: "bg-red-50 text-red-600" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: "Düşük", color: "text-gray-500" },
  MEDIUM: { label: "Orta", color: "text-blue-600" },
  HIGH: { label: "Yüksek", color: "text-orange-600" },
  URGENT: { label: "Acil", color: "text-red-600" },
};

type Report = {
  id: string;
  trackingCode: string;
  title: string;
  status: string;
  priority: string;
  severity: string;
  category: { name_tr: string };
  assignedTo: { name: string } | null;
  createdAt: string;
  slaAckDeadline: string;
  acknowledgedAt: string | null;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = reports.filter((r) => {
    const matchSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.trackingCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">İhbarlar</h1>
        <p className="page-subtitle">
          {reports.length} ihbar bulundu
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Başlık veya takip kodu ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
            >
              <option value="">Tüm Durumlar</option>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Takip Kodu</th>
              <th>Başlık</th>
              <th>Kategori</th>
              <th>Durum</th>
              <th>Öncelik</th>
              <th>Atanan</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="text-center py-16">
                    <Inbox className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">
                      {reports.length === 0
                        ? "Henüz ihbar yok"
                        : "Sonuç bulunamadı"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((report) => (
                <tr key={report.id} className="cursor-pointer group">
                  <td>
                    <Link
                      href={`/dashboard/reports/${report.id}`}
                      className="font-mono text-[13px] text-brand-600 hover:text-brand-700 font-medium"
                    >
                      {report.trackingCode}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/dashboard/reports/${report.id}`}
                      className="text-[13px] text-gray-900 group-hover:text-brand-700 font-medium transition-colors"
                    >
                      {report.title}
                    </Link>
                  </td>
                  <td className="text-[13px] text-gray-500">
                    {report.category.name_tr}
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        STATUS_CONFIG[report.status]?.bg
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[report.status]?.dot}`}
                      />
                      {STATUS_CONFIG[report.status]?.label}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`text-[12px] font-semibold ${
                        PRIORITY_CONFIG[report.priority]?.color
                      }`}
                    >
                      {PRIORITY_CONFIG[report.priority]?.label}
                    </span>
                  </td>
                  <td className="text-[13px] text-gray-500">
                    {report.assignedTo?.name || (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="text-[13px] text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
