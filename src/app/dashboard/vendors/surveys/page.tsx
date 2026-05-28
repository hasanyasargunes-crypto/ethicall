"use client";

import { useState, useEffect } from "react";
import { Plus, ClipboardList, Trash2, Edit, Star, FileQuestion } from "lucide-react";

type Template = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  isDefault: boolean;
  questions: any[];
  createdAt: string;
  _count: { surveys: number };
};

export default function SurveyTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "", isDefault: false, useDefaultQuestions: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTemplates(); }, []);

  async function fetchTemplates() {
    const res = await fetch("/api/vendors/survey-templates");
    if (res.ok) setTemplates(await res.json());
    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", description: "", category: "", isDefault: false, useDefaultQuestions: true });
    setShowModal(true);
  }

  function openEdit(t: Template) {
    setEditingId(t.id);
    setForm({ name: t.name, description: t.description || "", category: t.category || "", isDefault: t.isDefault, useDefaultQuestions: false });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const url = editingId ? `/api/vendors/survey-templates/${editingId}` : "/api/vendors/survey-templates";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      fetchTemplates();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu şablonu silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/vendors/survey-templates/${id}`, { method: "DELETE" });
    if (res.ok) fetchTemplates();
    else {
      const data = await res.json();
      alert(data.error || "Silme başarısız");
    }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Anket Şablonları</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tedarikçi uyum anketlerini yönetin</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Yeni Şablon
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">Henüz anket şablonu oluşturulmamış</p>
          <p className="text-xs text-gray-400">Varsayılan KVKK ve Bilgi Güvenliği anketi ile başlayın</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-brand-600" />
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  {t.isDefault && (
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {t.description && <p className="text-sm text-gray-500 mb-3">{t.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{(t.questions as any[])?.length || 0} soru</span>
                <span>{t._count.surveys} kez kullanıldı</span>
                {t.category && <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500">{t.category}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Şablonu Düzenle" : "Yeni Anket Şablonu"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şablon Adı *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Örneğin: KVKK ve Bilgi Güvenliği Uyum Anketi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="kvkk">KVKK Uyum</option>
                  <option value="security">Bilgi Güvenliği</option>
                  <option value="esg">ESG / Sürdürülebilirlik</option>
                  <option value="general">Genel Uyum</option>
                </select>
              </div>
              {!editingId && (
                <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="useDefault"
                    checked={form.useDefaultQuestions}
                    onChange={(e) => setForm({ ...form, useDefaultQuestions: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="useDefault" className="text-sm text-brand-700">
                    Varsayılan KVKK ve Bilgi Güvenliği sorularını kullan (15 soru)
                  </label>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">Varsayılan şablon olarak ayarla</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">İptal</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
