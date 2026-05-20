"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: "Yeni", color: "bg-blue-100 text-blue-700" },
  ACKNOWLEDGED: { label: "Onaylandı", color: "bg-yellow-100 text-yellow-700" },
  UNDER_REVIEW: { label: "İnceleniyor", color: "bg-purple-100 text-purple-700" },
  INVESTIGATING: { label: "Soruşturuluyor", color: "bg-orange-100 text-orange-700" },
  RESOLVED: { label: "Çözüldü", color: "bg-green-100 text-green-700" },
  CLOSED: { label: "Kapatıldı", color: "bg-gray-100 text-gray-700" },
  DISMISSED: { label: "Reddedildi", color: "bg-red-100 text-red-700" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: "Düşük", color: "bg-gray-100 text-gray-600" },
  MEDIUM: { label: "Orta", color: "bg-blue-100 text-blue-600" },
  HIGH: { label: "Yüksek", color: "bg-orange-100 text-orange-600" },
  URGENT: { label: "Acil", color: "bg-red-100 text-red-600" },
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
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.trackingCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">İhbarlar</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ara... (başlık veya takip kodu)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Tüm Durumlar</option>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 text-sm font-medium text-gray-600">Takip Kodu</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Başlık</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Kategori</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Durum</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Öncelik</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Atanan</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    {reports.length === 0 ? "Henüz ihbar yok" : "Sonuç bulunamadı"}
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="p-3">
                      <Link href={`/dashboard/reports/${report.id}`} className="font-mono text-sm text-blue-600 hover:underline">
                        {report.trackingCode}
                      </Link>
                    </td>
                    <td className="p-3">
                      <Link href={`/dashboard/reports/${report.id}`} className="text-sm hover:underline">
                        {report.title}
                      </Link>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{report.category.name_tr}</td>
                    <td className="p-3">
                      <Badge className={STATUS_CONFIG[report.status]?.color + " text-xs"}>
                        {STATUS_CONFIG[report.status]?.label}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={PRIORITY_CONFIG[report.priority]?.color + " text-xs"}>
                        {PRIORITY_CONFIG[report.priority]?.label}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {report.assignedTo?.name || "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
