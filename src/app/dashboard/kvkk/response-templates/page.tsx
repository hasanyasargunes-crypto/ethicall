"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Star, MessageSquareText } from "lucide-react";
import { RESPONSE_TYPE_LABELS } from "@/lib/kvkk-constants";

type Template = {
  id: string;
  name: string;
  type: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
};

const TYPES = ["FULL_APPROVAL", "PARTIAL_APPROVAL", "REJECTION", "INFO_REQUEST"] as const;

export default function ResponseTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<string>("FULL_APPROVAL");
  const [content, setContent] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    const res = await fetch("/api/kvkk/response-templates");
    if (res.ok) setTemplates(await res.json());
    setLoading(false);
  }

  function openNew() {
    setEditTemplate(null);
    setName("");
    setType("FULL_APPROVAL");
    setContent("");
    setIsDefault(false);
    setShowForm(true);
  }

  function openEdit(t: Template) {
    setEditTemplate(t);
    setName(t.name);
    setType(t.type);
    setContent(t.content);
    setIsDefault(t.isDefault);
    setShowForm(true);
  }

  async function handleSave() {
    if (!name || !content) return;
    setSaving(true);

    const payload = { id: editTemplate?.id, name, type, content, isDefault };
    const res = await fetch("/api/kvkk/response-templates", {
      method: editTemplate ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowForm(false);
      fetchTemplates();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu şablonu silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/kvkk/response-templates?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchTemplates();
  }

  const typeColors: Record<string, string> = {
    FULL_APPROVAL: "bg-emerald-50 text-emerald-700",
    PARTIAL_APPROVAL: "bg-teal-50 text-teal-700",
    REJECTION: "bg-red-50 text-red-600",
    INFO_REQUEST: "bg-amber-50 text-amber-700",
  };

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
          <h1 className="page-header">Cevap Şablonları</h1>
          <p className="page-subtitle">KVKK başvurularına verilecek hazır cevap şablonları</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Yeni Şablon
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-gray-900">
                {editTemplate ? "Şablonu Düzenle" : "Yeni Şablon"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Şablon Adı</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Standart Kabul Cevabı"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Cevap Türü</label>
                <div className="flex gap-2 flex-wrap">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-2 rounded-lg border-2 text-[13px] font-medium transition-all ${type === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                    >
                      {RESPONSE_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Şablon İçeriği</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Sayın {{başvuran_adı}},&#10;&#10;{{tarih}} tarihli başvurunuz incelenmiştir...&#10;&#10;Değişkenler: {{başvuran_adı}}, {{tarih}}, {{takip_kodu}}, {{şirket_adı}}"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none font-mono"
                />
              </div>
              <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Bu türdeki varsayılan şablon olarak ayarla
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  İptal
                </button>
                <button onClick={handleSave} disabled={saving || !name || !content} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50">
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <MessageSquareText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-4">Henüz cevap şablonu oluşturulmamış</p>
          <button
            onClick={openNew}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            İlk şablonunuzu oluşturun
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[14px] font-semibold text-gray-900">{t.name}</h4>
                    {t.isDefault && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeColors[t.type]}`}>
                    {RESPONSE_TYPE_LABELS[t.type]}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[12px] text-gray-500 line-clamp-3">{t.content}</p>
              <p className="text-[10px] text-gray-400 mt-3">
                {new Date(t.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
