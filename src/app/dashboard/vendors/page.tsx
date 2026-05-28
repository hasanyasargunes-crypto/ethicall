"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Search, Building2, ShieldCheck, ShieldAlert, ShieldX, ShieldOff,
  MoreHorizontal, Mail, Phone, ExternalLink, Trash2, Edit, ClipboardList,
} from "lucide-react";
import { VENDOR_STATUS_CONFIG, RISK_LEVEL_CONFIG } from "@/lib/vendor-constants";

type Vendor = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  sector: string | null;
  status: string;
  overallRiskScore: number | null;
  riskLevel: string | null;
  portalToken: string;
  createdAt: string;
  _count: { surveys: number; documents: number };
  surveys: { status: string; riskScore: number | null; completedAt: string | null }[];
};

const riskIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  LOW: ShieldCheck,
  MEDIUM: ShieldAlert,
  HIGH: ShieldX,
  CRITICAL: ShieldOff,
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ companyName: "", contactName: "", contactEmail: "", contactPhone: "", sector: "", taxId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchVendors(); }, []);

  async function fetchVendors() {
    const res = await fetch("/api/vendors");
    if (res.ok) setVendors(await res.json());
    setLoading(false);
  }

  async function handleAdd() {
    setSaving(true);
    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowAddModal(false);
      setForm({ companyName: "", contactName: "", contactEmail: "", contactPhone: "", sector: "", taxId: "" });
      fetchVendors();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu tedarikçiyi silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    fetchVendors();
  }

  const filtered = vendors.filter(
    (v) =>
      v.companyName.toLowerCase().includes(search.toLowerCase()) ||
      v.contactName.toLowerCase().includes(search.toLowerCase()) ||
      v.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  function RiskBadge({ score, level }: { score: number | null; level: string | null }) {
    if (score === null || !level) {
      return <span className="text-xs text-gray-400">Puanlanmadı</span>;
    }
    const config = RISK_LEVEL_CONFIG[level];
    const Icon = riskIcons[level] || ShieldAlert;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config?.bg || ""}`}>
        <Icon className="h-3.5 w-3.5" />
        <span>%{score}</span>
        <span className="hidden sm:inline">- {config?.label}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tedarikçiler</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vendors.length} tedarikçi kayıtlı</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tedarikçi Ekle
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tedarikçi ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Toplam", value: vendors.length, color: "text-gray-900" },
          { label: "Aktif", value: vendors.filter((v) => v.status === "ACTIVE").length, color: "text-emerald-600" },
          { label: "Düşük Risk", value: vendors.filter((v) => v.riskLevel === "LOW").length, color: "text-emerald-600" },
          { label: "Yüksek Risk", value: vendors.filter((v) => v.riskLevel === "HIGH" || v.riskLevel === "CRITICAL").length, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Vendor List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Henüz tedarikçi eklenmemiş</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Şirket</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">İlgili Kişi</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Sektör</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Risk Skoru</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Durum</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Anket</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((v) => {
                  const statusConf = VENDOR_STATUS_CONFIG[v.status] || VENDOR_STATUS_CONFIG.ACTIVE;
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/vendors/${v.id}`} className="font-medium text-gray-900 hover:text-brand-600">
                          {v.companyName}
                        </Link>
                        <p className="text-xs text-gray-400 md:hidden">{v.contactName}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-700">{v.contactName}</p>
                        <p className="text-xs text-gray-400">{v.contactEmail}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{v.sector || "-"}</td>
                      <td className="px-4 py-3">
                        <RiskBadge score={v.overallRiskScore} level={v.riskLevel} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{v._count.surveys} anket</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/vendors/${v.id}`}
                            className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                            title="Detay"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Yeni Tedarikçi Ekle</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı *</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Örneğin: X Lojistik A.Ş."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İlgili Kişi *</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="iletisim@sirket.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vergi No</label>
                  <input
                    type="text"
                    value={form.taxId}
                    onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sektör</label>
                <select
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Seçiniz</option>
                  {["Teknoloji","Lojistik","Üretim","Finans","Sağlık","İnşaat","Enerji","Perakende","Gıda","Danışmanlık","Hukuk","Eğitim","Medya","Diğer"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                İptal
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !form.companyName || !form.contactName || !form.contactEmail}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? "Ekleniyor..." : "Tedarikçi Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
