"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Inbox, LayoutGrid, List } from "lucide-react";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { DATA_REQUEST_STATUS_CONFIG, KANBAN_COLUMNS, KVKK_RIGHT_LABELS } from "@/lib/kvkk-constants";
import type { KanbanItem } from "@/components/dashboard/KanbanBoard";

type DataRequest = {
  id: string;
  trackingCode: string;
  applicantName: string;
  applicantSurname: string;
  rightType: string;
  subject: string;
  status: string;
  assignedTo: { name: string } | null;
  slaDeadline: string;
  createdAt: string;
};

export default function KVKKApplicationsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");

  useEffect(() => {
    fetch("/api/kvkk/applications")
      .then((r) => r.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = requests.filter((r) => {
    const matchSearch =
      !search ||
      `${r.applicantName} ${r.applicantSurname}`.toLowerCase().includes(search.toLowerCase()) ||
      r.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleStatusChange(itemId: string, newStatus: string) {
    const res = await fetch(`/api/kvkk/applications/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setRequests((prev) => prev.map((r) => (r.id === itemId ? { ...r, status: newStatus } : r)));
    }
  }

  const kanbanItems: KanbanItem[] = filtered.map((r) => {
    const isOverdue = new Date(r.slaDeadline) < new Date() && !["COMPLETED", "REJECTED"].includes(r.status);
    return {
      id: r.id,
      title: r.subject.length > 60 ? r.subject.slice(0, 60) + "..." : r.subject,
      subtitle: `${r.applicantName} ${r.applicantSurname}`,
      status: r.status,
      badge: isOverdue
        ? { label: "SLA Aşımı", color: "bg-red-100 text-red-700" }
        : undefined,
      meta: new Date(r.createdAt).toLocaleDateString("tr-TR"),
    };
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">KVKK Başvuruları</h1>
          <p className="page-subtitle">{requests.length} başvuru bulundu</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-2 rounded-md transition-colors ${viewMode === "kanban" ? "bg-white shadow-sm text-brand-700" : "text-gray-500 hover:text-gray-700"}`}
            title="Kanban Görünümü"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-brand-700" : "text-gray-500 hover:text-gray-700"}`}
            title="Liste Görünümü"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Başvuran, takip kodu veya konu ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
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
              {Object.entries(DATA_REQUEST_STATUS_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <KanbanBoard
            columns={KANBAN_COLUMNS}
            items={kanbanItems}
            onStatusChange={handleStatusChange}
            onItemClick={(item) => router.push(`/dashboard/kvkk/applications/${item.id}`)}
            emptyText="Henüz KVKK başvurusu yok"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table min-w-[800px]">
              <thead>
                <tr>
                  <th>Takip Kodu</th>
                  <th>Başvuran</th>
                  <th>Hak Türü</th>
                  <th>Konu</th>
                  <th>Durum</th>
                  <th>SLA</th>
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
                          {requests.length === 0 ? "Henüz başvuru yok" : "Sonuç bulunamadı"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((req) => {
                    const isOverdue = new Date(req.slaDeadline) < new Date() && !["COMPLETED", "REJECTED"].includes(req.status);
                    const daysLeft = Math.ceil((new Date(req.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={req.id} className="cursor-pointer group" onClick={() => router.push(`/dashboard/kvkk/applications/${req.id}`)}>
                        <td>
                          <span className="font-mono text-[13px] text-brand-600 font-medium">
                            {req.trackingCode}
                          </span>
                        </td>
                        <td className="text-[13px] text-gray-900 font-medium">
                          {req.applicantName} {req.applicantSurname}
                        </td>
                        <td className="text-[12px] text-gray-500 max-w-[180px] truncate">
                          {KVKK_RIGHT_LABELS[req.rightType]?.tr || req.rightType}
                        </td>
                        <td className="text-[13px] text-gray-700 max-w-[200px] truncate">
                          {req.subject}
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${DATA_REQUEST_STATUS_CONFIG[req.status]?.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${DATA_REQUEST_STATUS_CONFIG[req.status]?.dot}`} />
                            {DATA_REQUEST_STATUS_CONFIG[req.status]?.label}
                          </span>
                        </td>
                        <td>
                          <span className={`text-[12px] font-medium ${isOverdue ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-gray-500"}`}>
                            {isOverdue ? "Aşıldı" : `${daysLeft} gün`}
                          </span>
                        </td>
                        <td className="text-[13px] text-gray-400">
                          {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
