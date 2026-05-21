"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Plus, Trash2, GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type FieldType = "text" | "textarea" | "select" | "checkbox" | "date" | "number";

type FormField = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select type
};

type Category = {
  id: string;
  name_tr: string;
  name_en: string;
  icon: string;
  formTemplate: { id: string; fields: FormField[] } | null;
};

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Kisa Metin" },
  { value: "textarea", label: "Uzun Metin" },
  { value: "select", label: "Secim Listesi" },
  { value: "checkbox", label: "Onay Kutusu" },
  { value: "date", label: "Tarih" },
  { value: "number", label: "Sayi" },
];

export default function FormBuilderPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/form-template");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
      if (data.length > 0 && !selectedCat) {
        setSelectedCat(data[0].id);
        setFields((data[0].formTemplate?.fields as FormField[]) || []);
      }
    }
    setLoading(false);
  }, [selectedCat]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function selectCategory(catId: string) {
    setSelectedCat(catId);
    const cat = categories.find(c => c.id === catId);
    setFields((cat?.formTemplate?.fields as FormField[]) || []);
    setSuccess("");
  }

  function addField() {
    setFields([...fields, {
      id: `field-${Date.now()}`,
      label: "",
      type: "text",
      required: false,
      placeholder: "",
    }]);
  }

  function updateField(index: number, updates: Partial<FormField>) {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  async function saveTemplate() {
    setSaving(true);
    setSuccess("");
    const res = await fetch(`/api/form-template/${selectedCat}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    if (res.ok) {
      setSuccess("Form sablonu kaydedildi!");
      fetchCategories();
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="text-center py-8">Yukleniyor...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ihbar Formu Duzenleyici</h1>
        <p className="text-sm text-gray-500">Her kategori icin ozel form alanlari ekleyin</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="col-span-1 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">Kategoriler</p>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedCat === cat.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{cat.name_tr}</span>
                {cat.formTemplate && (cat.formTemplate.fields as FormField[]).length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {(cat.formTemplate.fields as FormField[]).length}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Form Fields Editor */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    {categories.find(c => c.id === selectedCat)?.name_tr || "Kategori Sec"}
                  </CardTitle>
                  <CardDescription>
                    Ihbar formuna ek alanlar ekleyin. Temel alanlar (baslik, aciklama, ciddiyet) otomatik eklenir.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={addField} className="gap-1">
                    <Plus className="h-4 w-4" />
                    Alan Ekle
                  </Button>
                  <Button onClick={saveTemplate} disabled={saving} className="gap-1">
                    <Save className="h-4 w-4" />
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">{success}</div>}

              {fields.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Bu kategori icin henuz ek alan eklenmemis.</p>
                  <Button variant="outline" onClick={addField} className="mt-4 gap-1">
                    <Plus className="h-4 w-4" /> Ilk Alani Ekle
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, i) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start gap-3">
                        <GripVertical className="h-5 w-5 text-gray-300 mt-2 shrink-0 cursor-grab" />
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Alan Adi</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(i, { label: e.target.value })}
                              placeholder="Ornek: Olay Tarihi"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Tip</Label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
                              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            >
                              {FIELD_TYPES.map(ft => (
                                <option key={ft.value} value={ft.value}>{ft.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Placeholder</Label>
                            <Input
                              value={field.placeholder || ""}
                              onChange={(e) => updateField(i, { placeholder: e.target.value })}
                              placeholder="Ipucu metni..."
                            />
                          </div>
                          {field.type === "select" && (
                            <div className="col-span-2 space-y-1">
                              <Label className="text-xs">Secenekler (virgul ile ayirin)</Label>
                              <Input
                                value={(field.options || []).join(", ")}
                                onChange={(e) => updateField(i, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                placeholder="Secenek 1, Secenek 2, Secenek 3"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-4">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(i, { required: e.target.checked })}
                              id={`req-${field.id}`}
                              className="rounded"
                            />
                            <label htmlFor={`req-${field.id}`} className="text-sm text-gray-600">Zorunlu alan</label>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeField(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
