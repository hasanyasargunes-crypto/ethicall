"use client";

import { useState, useEffect } from "react";
import { Settings, Palette, Type, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Nunito",
  "Lato",
  "Montserrat",
  "Source Sans Pro",
];

const PRESET_COLORS = [
  { name: "Mavi", primary: "#1a56db", secondary: "#1e40af" },
  { name: "Yesil", primary: "#059669", secondary: "#047857" },
  { name: "Mor", primary: "#7c3aed", secondary: "#6d28d9" },
  { name: "Kirmizi", primary: "#dc2626", secondary: "#b91c1c" },
  { name: "Turuncu", primary: "#ea580c", secondary: "#c2410c" },
  { name: "Koyu", primary: "#1f2937", secondary: "#111827" },
];

export default function SettingsPage() {
  const [primaryColor, setPrimaryColor] = useState("#1a56db");
  const [secondaryColor, setSecondaryColor] = useState("#1e40af");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchTheme() {
      const res = await fetch("/api/settings/theme");
      if (res.ok) {
        const data = await res.json();
        setPrimaryColor(data.primaryColor || "#1a56db");
        setSecondaryColor(data.secondaryColor || "#1e40af");
        setFontFamily(data.fontFamily || "Inter");
      }
      setLoading(false);
    }
    fetchTheme();
  }, []);

  async function saveTheme() {
    setSaving(true);
    setSuccess("");
    const res = await fetch("/api/settings/theme", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryColor, secondaryColor, fontFamily }),
    });
    if (res.ok) {
      setSuccess("Tema ayarlari kaydedildi!");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="text-center py-8">Yukleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ayarlar</h1>

      {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">{success}</div>}

      {/* Theme Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema Ayarlari
          </CardTitle>
          <CardDescription>
            Panelin renklerini ve fontlarini organizasyonunuza gore ozellestirin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Presets */}
          <div className="space-y-2">
            <Label>Hazir Renk Sablonlari</Label>
            <div className="flex gap-3 flex-wrap">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => { setPrimaryColor(preset.primary); setSecondaryColor(preset.secondary); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    primaryColor === preset.primary
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.secondary }} />
                  </div>
                  <span className="text-sm">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ana Renk</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ikincil Renk</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <p className="text-sm text-gray-500 mb-3">Onizleme</p>
            <div className="flex gap-3 items-center">
              <button
                className="px-4 py-2 text-white rounded-lg text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Ana Buton
              </button>
              <button
                className="px-4 py-2 text-white rounded-lg text-sm font-medium"
                style={{ backgroundColor: secondaryColor }}
              >
                Ikincil Buton
              </button>
              <div className="px-3 py-1 rounded text-sm" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>
                Badge Ornegi
              </div>
            </div>
          </div>

          {/* Font */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Ailesi
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {FONTS.map((font) => (
                <button
                  key={font}
                  onClick={() => setFontFamily(font)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    fontFamily === font
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveTheme} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Kaydediliyor..." : "Tema Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
