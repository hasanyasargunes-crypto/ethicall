"use client";

import { useEffect, useState } from "react";
import { Plus, Eye, Copy, Check, Trash2, GripVertical, Globe } from "lucide-react";

type FormField = {
  id: string;
  label_tr: string;
  label_en: string;
  type: "text" | "textarea" | "select" | "file";
  required: boolean;
  options?: string[];
};

type KVKKForm = {
  id: string;
  name: string;
  fields: FormField[];
  status: string;
  publicToken: string | null;
  description: string | null;
  locale: string;
};

const DEFAULT_FIELDS: FormField[] = [
  { id: "name", label_tr: "Ad", label_en: "First Name", type: "text", required: true },
  { id: "surname", label_tr: "Soyad", label_en: "Last Name", type: "text", required: true },
  { id: "tckn", label_tr: "T.C. Kimlik No", label_en: "National ID Number", type: "text", required: false },
  { id: "address", label_tr: "Adres", label_en: "Address", type: "textarea", required: true },
  { id: "email", label_tr: "E-posta", label_en: "Email", type: "text", required: true },
  { id: "phone", label_tr: "Telefon", label_en: "Phone", type: "text", required: false },
  { id: "subject", label_tr: "Başvuru Konusu", label_en: "Request Subject", type: "text", required: true },
  { id: "description", label_tr: "Detaylı Açıklama", label_en: "Detailed Description", type: "textarea", required: true },
  { id: "identity_doc", label_tr: "Kimlik Fotokopisi", label_en: "ID Copy", type: "file", required: false },
  { id: "proxy_doc", label_tr: "Vekaletname (Vekil başvurusu ise)", label_en: "Power of Attorney (if proxy)", type: "file", required: false },
];

export default function KVKKFormBuilderPage() {
  const [forms, setForms] = useState<KVKKForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentForm, setCurrentForm] = useState<KVKKForm | null>(null);
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FIELDS);
  const [formName, setFormName] = useState("KVKK Başvuru Formu");
  const [formLocale, setFormLocale] = useState("tr");
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/kvkk/form-template")
      .then((r) => r.json())
      .then((data) => {
        setForms(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          const form = data[0];
          setCurrentForm(form);
          setFormName(form.name);
          setFields(form.fields?.length > 0 ? form.fields : DEFAULT_FIELDS);
          setFormLocale(form.locale || "tr");
          setFormDescription(form.description || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function addField() {
    setFields([
      ...fields,
      {
        id: `custom_${Date.now()}`,
        label_tr: "Yeni Alan",
        label_en: "New Field",
        type: "text",
        required: false,
      },
    ]);
  }

  function removeField(id: string) {
    setFields(fields.filter((f) => f.id !== id));
  }

  function updateField(id: string, updates: Partial<FormField>) {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }

  async function handleSave(publish: boolean) {
    setSaving(true);
    const payload = {
      id: currentForm?.id,
      name: formName,
      fields,
      status: publish ? "LIVE" : "DRAFT",
      description: formDescription,
      locale: formLocale,
    };

    const res = await fetch("/api/kvkk/form-template", {
      method: currentForm ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updated = await res.json();
      setCurrentForm(updated);
      setForms((prev) => {
        const idx = prev.findIndex((f) => f.id === updated.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = updated;
          return copy;
        }
        return [updated, ...prev];
      });
    }
    setSaving(false);
  }

  function copyFormLink() {
    if (!currentForm?.publicToken) return;
    const url = `${window.location.origin}/kvkk-form/${currentForm.publicToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
          <h1 className="page-header">KVKK Başvuru Formu</h1>
          <p className="page-subtitle">İlgili kişi başvuru formunuzu özelleştirin</p>
        </div>
        <div className="flex items-center gap-2">
          {currentForm?.publicToken && (
            <button
              onClick={copyFormLink}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              {copied ? <Check className="h-4 w-4 text-brand-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Kopyalandı" : "Form Linki"}
            </button>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50"
          >
            Taslak Kaydet
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Yayınla"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form Settings */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Form Ayarları</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Form Adı</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Açıklama</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Başvuranların göreceği açıklama..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Dil</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormLocale("tr")}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 text-[13px] font-medium transition-all ${formLocale === "tr" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600"}`}
                  >
                    <Globe className="h-3.5 w-3.5" /> Türkçe
                  </button>
                  <button
                    onClick={() => setFormLocale("en")}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 text-[13px] font-medium transition-all ${formLocale === "en" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600"}`}
                  >
                    <Globe className="h-3.5 w-3.5" /> English
                  </button>
                </div>
              </div>
            </div>
          </div>

          {currentForm && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Durum</h3>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${currentForm.status === "LIVE" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currentForm.status === "LIVE" ? "bg-emerald-500" : "bg-gray-400"}`} />
                {currentForm.status === "LIVE" ? "Yayında" : "Taslak"}
              </span>
              {currentForm.publicToken && (
                <div className="mt-3">
                  <p className="text-[11px] text-gray-400 mb-1">Form URL</p>
                  <p className="text-[11px] text-brand-600 break-all font-mono">
                    /kvkk-form/{currentForm.publicToken}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-gray-900">Form Alanları ({fields.length})</h3>
              <button
                onClick={addField}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-brand-600 hover:bg-brand-50 rounded-lg font-medium"
              >
                <Plus className="h-4 w-4" /> Alan Ekle
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
                  <GripVertical className="h-4 w-4 text-gray-300 mt-2.5 cursor-grab shrink-0" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      value={formLocale === "tr" ? field.label_tr : field.label_en}
                      onChange={(e) =>
                        updateField(field.id, formLocale === "tr" ? { label_tr: e.target.value } : { label_en: e.target.value })
                      }
                      className="sm:col-span-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      placeholder="Alan adı"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as FormField["type"] })}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="text">Metin</option>
                      <option value="textarea">Uzun Metin</option>
                      <option value="select">Seçim</option>
                      <option value="file">Dosya</option>
                    </select>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[12px] text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        Zorunlu
                      </label>
                      <button
                        onClick={() => removeField(field.id)}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
