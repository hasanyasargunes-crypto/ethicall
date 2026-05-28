"use client";

import { useState, useEffect, use } from "react";
import { Shield, Lock, CheckCircle, Send, ArrowRight, ArrowLeft, Paperclip, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import Image from "next/image";

const SEVERITY_OPTIONS = [
  { value: "LOW", label: "Düşük", color: "bg-gray-100 text-gray-700" },
  { value: "MEDIUM", label: "Orta", color: "bg-blue-100 text-blue-700" },
  { value: "HIGH", label: "Yüksek", color: "bg-orange-100 text-orange-700" },
  { value: "CRITICAL", label: "Kritik", color: "bg-red-100 text-red-700" },
];

type Category = { id: string; name_tr: string; name_en: string; icon: string };

type OrgBranding = {
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  fontFamily: string | null;
};

export default function ReportPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = use(params);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branding, setBranding] = useState<OrgBranding | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch org branding
  useEffect(() => {
    async function fetchBranding() {
      try {
        const res = await fetch(`/api/org-branding?slug=${orgSlug}`);
        if (res.ok) {
          const data = await res.json();
          setBranding(data);
        }
      } catch {
        // Silently fail - will use defaults
      }
    }
    fetchBranding();
  }, [orgSlug]);

  const primaryColor = branding?.primaryColor || "#059669";
  const secondaryColor = branding?.secondaryColor || "#047857";
  const orgName = branding?.name || orgSlug;

  async function sendOtp() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/verify/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, orgSlug }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }
    if (data.demoCode) {
      setOtp(data.demoCode);
    }
    setStep(2);
    setLoading(false);
  }

  async function verifyOtp() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/verify/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otp, orgSlug }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }
    const catRes = await fetch(`/api/categories?orgSlug=${orgSlug}`);
    if (catRes.ok) {
      const cats = await catRes.json();
      setCategories(cats);
    }
    setStep(3);
    setLoading(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        setError("Dosya boyutu 10MB'yi asamaz");
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    e.target.value = ""; // Reset input
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  async function submitReport() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        categoryId: selectedCategory,
        severity,
        orgSlug,
        reporterEmail: email,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    // Upload files if any
    if (files.length > 0) {
      setUploading(true);
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("trackingCode", data.trackingCode);
        await fetch("/api/upload", { method: "POST", body: formData }).catch(
          (err) => console.error("File upload error:", err)
        );
      }
      setUploading(false);
    }

    setTrackingCode(data.trackingCode);
    setStep(5);
    setLoading(false);
  }

  const progressValue = (step / 5) * 100;

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom, ${primaryColor}08, ${primaryColor}03, #f9fafb)`,
      }}
    >
      {/* Dynamic Header */}
      <header className="bg-white border-b" style={{ borderBottomColor: `${primaryColor}20` }}>
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          {branding?.logoUrl ? (
            <Image
              src={branding.logoUrl}
              alt={orgName}
              width={36}
              height={36}
              className="rounded-lg object-contain"
              unoptimized
            />
          ) : (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              {orgName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span className="font-bold text-lg text-gray-900">{orgName}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-gray-500 text-sm">Etik İhbar Hattı</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressValue}%`,
                backgroundColor: primaryColor,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>E-posta Doğrulama</span>
            <span>Kategori</span>
            <span>Detaylar</span>
            <span>Tamamlandı</span>
          </div>
        </div>

        {/* Privacy Notice */}
        <div
          className="flex items-center gap-2 rounded-lg p-3 mb-6 text-sm"
          style={{
            backgroundColor: `${primaryColor}08`,
            borderColor: `${primaryColor}25`,
            color: secondaryColor,
            border: `1px solid ${primaryColor}25`,
          }}
        >
          <Lock className="h-4 w-4 shrink-0" />
          <span>Kimliğiniz tamamen gizli tutulmaktadır. E-posta adresiniz şirketinizle paylaşılmayacaktır.</span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Kimliğinizi Doğrulayın</CardTitle>
              <CardDescription>
                Kurumsal e-posta adresinizi girerek bu şirkette çalıştığınızı doğrulayın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Kurumsal E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`ornek@${orgSlug}.com`}
                  />
                </div>
                <Button
                  onClick={sendOtp}
                  disabled={!email || loading}
                  className="w-full text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {loading ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Doğrulama Kodu</CardTitle>
              <CardDescription>
                {email} adresine gönderilen 6 haneli kodu girin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {otp.length === 6 && (
                  <div
                    className="rounded-lg p-3 text-sm"
                    style={{
                      backgroundColor: `${primaryColor}08`,
                      border: `1px solid ${primaryColor}25`,
                      color: secondaryColor,
                    }}
                  >
                    Demo modu: Doğrulama kodu otomatik olarak dolduruldu. Doğrudan &quot;Doğrula&quot; butonuna basabilirsiniz.
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="otp">Doğrulama Kodu</Label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button
                  onClick={verifyOtp}
                  disabled={otp.length !== 6 || loading}
                  className="w-full text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {loading ? "Doğrulanıyor..." : "Doğrula"}
                </Button>
                <Button variant="ghost" onClick={() => setStep(1)} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Geri Dön
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>İhbar Konusu</CardTitle>
              <CardDescription>İhbarınızın konusunu seçin.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setStep(4);
                    }}
                    className="p-4 rounded-lg border-2 text-left transition-all"
                    style={{
                      borderColor:
                        selectedCategory === cat.id ? primaryColor : "#e5e7eb",
                      backgroundColor:
                        selectedCategory === cat.id ? `${primaryColor}08` : "white",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== cat.id) {
                        (e.target as HTMLElement).style.borderColor = `${primaryColor}60`;
                        (e.target as HTMLElement).style.backgroundColor = `${primaryColor}05`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== cat.id) {
                        (e.target as HTMLElement).style.borderColor = "#e5e7eb";
                        (e.target as HTMLElement).style.backgroundColor = "white";
                      }
                    }}
                  >
                    <p className="font-medium">{cat.name_tr}</p>
                    <p className="text-sm text-gray-500">{cat.name_en}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>İhbar Detayları</CardTitle>
              <CardDescription>Lütfen olayı mümkün olduğunca detaylı açıklayın.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="İhbarınızın kısa özeti"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Olayı detaylı olarak açıklayın. Ne oldu, ne zaman oldu, kimler dahil..."
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciddiyet Seviyesi</Label>
                  <div className="flex gap-2">
                    {SEVERITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSeverity(opt.value)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          severity === opt.value
                            ? opt.color + " ring-2 ring-offset-1"
                            : "bg-gray-100 text-gray-600"
                        }`}
                        style={
                          severity === opt.value
                            ? { "--tw-ring-color": primaryColor } as React.CSSProperties
                            : undefined
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Belge Ekle (opsiyonel)</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                      />
                      <Paperclip className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Dosya eklemek için tıklayın veya sürükleyin
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF, resim, Word, Excel (maks. 10MB, en fazla 5 dosya)
                      </p>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {files.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            onClick={() => removeFile(i)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Geri
                  </Button>
                  <Button
                    onClick={submitReport}
                    disabled={!title || !description || loading || uploading}
                    className="flex-1 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {uploading ? "Dosyalar yükleniyor..." : loading ? "Gönderiliyor..." : (
                      <>İhbarı Gönder <Send className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: primaryColor }} />
              <CardTitle className="text-2xl">İhbarınız Alındı</CardTitle>
              <CardDescription>İhbarınız başarıyla iletildi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm text-gray-500 mb-2">Takip Kodunuz</p>
                <p
                  className="text-3xl font-mono font-bold tracking-wider"
                  style={{ color: primaryColor }}
                >
                  {trackingCode}
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
                Bu kodu güvenli bir yerde saklayın. İhbarınızın durumunu bu kodla takip edebilirsiniz.
              </div>
              <Link href="/report/track">
                <Button variant="outline" className="gap-2">
                  İhbarınızı Takip Edin <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center">
        <p className="text-xs text-gray-400">
          Bu platform{" "}
          <Link href="/" className="underline hover:text-gray-500">
            EthicAll
          </Link>{" "}
          tarafından desteklenmektedir.
        </p>
      </footer>
    </div>
  );
}
