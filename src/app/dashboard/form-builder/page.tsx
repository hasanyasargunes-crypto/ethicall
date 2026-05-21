"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Globe,
  FileEdit,
  Copy,
  Check,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type FieldType = "text" | "textarea" | "select" | "checkbox" | "date" | "number" | "email" | "phone";

type FormField = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
};

type Category = {
  id: string;
  name_tr: string;
  name_en: string;
  icon: string;
  formTemplate: {
    id: string;
    name: string;
    fields: FormField[];
    status: string;
    publicToken: string | null;
    description: string | null;
  } | null;
};

const FIELD_TYPES: { value: FieldType; label: string; icon: string }[] = [
  { value: "text", label: "Kısa Metin", icon: "Aa" },
  { value: "textarea", label: "Uzun Metin", icon: "¶" },
  { value: "select", label: "Seçim Listesi", icon: "▼" },
  { value: "checkbox", label: "Onay Kutusu", icon: "☑" },
  { value: "date", label: "Tarih", icon: "📅" },
  { value: "number", label: "Sayı", icon: "#" },
  { value: "email", label: "E-posta", icon: "@" },
  { value: "phone", label: "Telefon", icon: "📞" },
];

export default function FormBuilderPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"DRAFT" | "LIVE">("DRAFT");
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/form-template");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
      if (data.length > 0 && !selectedCat) {
        selectCategory(data[0].id, data);
      }
    }
    setLoading(false);
  }, [selectedCat]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function selectCategory(catId: string, cats?: Category[]) {
    setSelectedCat(catId);
    const list = cats || categories;
    const cat = list.find((c) => c.id === catId);
    setFields((cat?.formTemplate?.fields as FormField[]) || []);
    setFormName(cat?.formTemplate?.name || cat?.name_tr || "");
    setFormDescription(cat?.formTemplate?.description || "");
    setFormStatus((cat?.formTemplate?.status as "DRAFT" | "LIVE") || "DRAFT");
    setPublicToken(cat?.formTemplate?.publicToken || null);
    setSuccess("");
    setExpandedField(null);
  }

  function addField() {
    const newId = `field-${Date.now()}`;
    setFields([
      ...fields,
      {
        id: newId,
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        helpText: "",
      },
    ]);
    setExpandedField(newId);
  }

  function updateField(index: number, updates: Partial<FormField>) {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  }

  function removeField(index: number) {
    const removed = fields[index];
    setFields(fields.filter((_, i) => i !== index));
    if (expandedField === removed.id) setExpandedField(null);
  }

  function moveField(index: number, direction: "up" | "down") {
    const newFields = [...fields];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newFields.length) return;
    [newFields[index], newFields[swapIdx]] = [newFields[swapIdx], newFields[index]];
    setFields(newFields);
  }

  async function saveTemplate(newStatus?: "DRAFT" | "LIVE") {
    setSaving(true);
    setSuccess("");
    const status = newStatus || formStatus;
    const res = await fetch(`/api/form-template/${selectedCat}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields,
        name: formName,
        description: formDescription,
        status,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setFormStatus(status);
      setPublicToken(data.publicToken);
      setSuccess(
        status === "LIVE"
          ? "Form canlıya alındı! Public link oluşturuldu."
          : "Form taslak olarak kaydedildi."
      );
      fetchCategories();
    }
    setSaving(false);
  }

  function copyPublicLink() {
    if (!publicToken) return;
    const url = `${window.location.origin}/report/${publicToken}`;
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

  const currentCat = categories.find((c) => c.id === selectedCat);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">İhbar Formu Düzenleyici</h1>
        <p className="page-subtitle">
          Her kategori için özel form alanları ekleyin, taslak olarak tutun veya
          canlıya alın.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Category Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                Kategoriler
              </p>
            </div>
            <div className="p-2">
              {categories.map((cat) => {
                const hasTemplate = cat.formTemplate && (cat.formTemplate.fields as FormField[]).length > 0;
                const isLive = cat.formTemplate?.status === "LIVE";
                return (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all mb-0.5 ${
                      selectedCat === cat.id
                        ? "bg-brand-50 text-brand-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{cat.name_tr}</span>
                      <div className="flex items-center gap-1">
                        {hasTemplate && (
                          <span className="text-[9px] text-gray-400">
                            {(cat.formTemplate!.fields as FormField[]).length}
                          </span>
                        )}
                        {isLive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Editor */}
        <div className="col-span-9">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-brand-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-gray-900">
                        {currentCat?.name_tr || "Kategori Seç"}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          formStatus === "LIVE"
                            ? "bg-brand-50 text-brand-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            formStatus === "LIVE" ? "bg-brand-500" : "bg-amber-500"
                          }`}
                        />
                        {formStatus === "LIVE" ? "Canlı" : "Taslak"}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-400">
                      Temel alanlar (başlık, açıklama, ciddiyet) otomatik eklenir.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addField}
                    className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                    Alan Ekle
                  </button>
                  <button
                    onClick={() => saveTemplate("DRAFT")}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <FileEdit className="h-4 w-4" />
                    Taslak Kaydet
                  </button>
                  <button
                    onClick={() => saveTemplate("LIVE")}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 text-[13px] text-white bg-brand-600 rounded-lg hover:bg-brand-700 font-medium"
                  >
                    <Globe className="h-4 w-4" />
                    {saving ? "Kaydediliyor..." : "Canlıya Al"}
                  </button>
                </div>
              </div>
            </div>

            {/* Public Link */}
            {publicToken && formStatus === "LIVE" && (
              <div className="px-6 py-3 bg-brand-50 border-b border-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-brand-600" />
                  <span className="text-[13px] text-brand-700">
                    Canlı form linki:
                  </span>
                  <code className="text-[12px] bg-white px-2 py-1 rounded border border-brand-200 text-brand-800 font-mono">
                    {window.location.origin}/report/{publicToken}
                  </code>
                </div>
                <button
                  onClick={copyPublicLink}
                  className="flex items-center gap-1 text-[12px] text-brand-600 hover:text-brand-700 font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Kopyala
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mx-6 mt-4 bg-brand-50 text-brand-700 p-3 rounded-lg text-[13px] flex items-center gap-2">
                <Check className="h-4 w-4" />
                {success}
              </div>
            )}

            {/* Form Meta */}
            <div className="px-6 pt-5 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-600 mb-1">
                    Form Adı
                  </label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Form başlığı"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-600 mb-1">
                    Açıklama
                  </label>
                  <input
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Form açıklaması (opsiyonel)"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="p-6">
              {fields.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                  <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 mb-3">
                    Bu kategori için henüz ek alan eklenmemiş.
                  </p>
                  <button
                    onClick={addField}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50"
                  >
                    <Plus className="h-4 w-4" /> İlk Alanı Ekle
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, i) => {
                    const isExpanded = expandedField === field.id;
                    return (
                      <div
                        key={field.id}
                        className={`border rounded-xl transition-all ${
                          isExpanded
                            ? "border-brand-200 bg-brand-50/30 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {/* Collapsed Header */}
                        <div
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                          onClick={() => setExpandedField(isExpanded ? null : field.id)}
                        >
                          <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                          <div className="flex-1 flex items-center gap-3">
                            <span className="text-[13px] font-medium text-gray-900">
                              {field.label || (
                                <span className="text-gray-400 italic">İsimsiz alan</span>
                              )}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                              {FIELD_TYPES.find((f) => f.value === field.type)?.label}
                            </span>
                            {field.required && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 font-medium">
                                Zorunlu
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveField(i, "up");
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              disabled={i === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveField(i, "down");
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              disabled={i === fields.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeField(i);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Editor */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                                  Alan Adı
                                </label>
                                <input
                                  value={field.label}
                                  onChange={(e) =>
                                    updateField(i, { label: e.target.value })
                                  }
                                  placeholder="Örn: Olay Tarihi"
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                                  Tip
                                </label>
                                <select
                                  value={field.type}
                                  onChange={(e) =>
                                    updateField(i, {
                                      type: e.target.value as FieldType,
                                    })
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                                >
                                  {FIELD_TYPES.map((ft) => (
                                    <option key={ft.value} value={ft.value}>
                                      {ft.icon} {ft.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                                  Placeholder
                                </label>
                                <input
                                  value={field.placeholder || ""}
                                  onChange={(e) =>
                                    updateField(i, {
                                      placeholder: e.target.value,
                                    })
                                  }
                                  placeholder="İpucu metni"
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                              </div>
                            </div>

                            {field.type === "select" && (
                              <div>
                                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                                  Seçenekler (virgül ile ayırın)
                                </label>
                                <input
                                  value={(field.options || []).join(", ")}
                                  onChange={(e) =>
                                    updateField(i, {
                                      options: e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                    })
                                  }
                                  placeholder="Seçenek 1, Seçenek 2, Seçenek 3"
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                                Yardım Metni (opsiyonel)
                              </label>
                              <input
                                value={field.helpText || ""}
                                onChange={(e) =>
                                  updateField(i, { helpText: e.target.value })
                                }
                                placeholder="Bu alanın nasıl doldurulacağına dair bilgi"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  updateField(i, { required: !field.required })
                                }
                                className="flex items-center gap-2 text-sm"
                              >
                                {field.required ? (
                                  <ToggleRight className="h-5 w-5 text-brand-600" />
                                ) : (
                                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                                )}
                                <span
                                  className={
                                    field.required
                                      ? "text-brand-700 font-medium"
                                      : "text-gray-500"
                                  }
                                >
                                  Zorunlu Alan
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Field Button */}
                  <button
                    onClick={addField}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-brand-600 hover:border-brand-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Yeni Alan Ekle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
