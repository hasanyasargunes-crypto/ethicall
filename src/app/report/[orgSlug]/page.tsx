"use client";

import { useState, use } from "react";
import { Shield, Lock, CheckCircle, Send, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const SEVERITY_OPTIONS = [
  { value: "LOW", label: "Düşük", color: "bg-gray-100 text-gray-700" },
  { value: "MEDIUM", label: "Orta", color: "bg-blue-100 text-blue-700" },
  { value: "HIGH", label: "Yüksek", color: "bg-orange-100 text-orange-700" },
  { value: "CRITICAL", label: "Kritik", color: "bg-red-100 text-red-700" },
];

type Category = { id: string; name_tr: string; name_en: string; icon: string };

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
    // Demo modunda kodu otomatik doldur
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
    setTrackingCode(data.trackingCode);
    setStep(5);
    setLoading(false);
  }

  const progressValue = (step / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg">EthicAll</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-600">{orgSlug}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Progress value={progressValue} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>E-posta Doğrulama</span>
            <span>Kategori</span>
            <span>Detaylar</span>
            <span>Tamamlandı</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-700">
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
                <Button onClick={sendOtp} disabled={!email || loading} className="w-full">
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                    📋 Demo modu: Doğrulama kodu otomatik olarak dolduruldu. Doğrudan &quot;Doğrula&quot; butonuna basabilirsiniz.
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
                <Button onClick={verifyOtp} disabled={otp.length !== 6 || loading} className="w-full">
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
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:border-blue-400 hover:bg-blue-50 ${
                      selectedCategory === cat.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
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
                            ? opt.color + " ring-2 ring-offset-1 ring-blue-400"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Geri
                  </Button>
                  <Button
                    onClick={submitReport}
                    disabled={!title || !description || loading}
                    className="flex-1"
                  >
                    {loading ? "Gönderiliyor..." : (
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
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">İhbarınız Alındı</CardTitle>
              <CardDescription>İhbarınız başarıyla iletildi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm text-gray-500 mb-2">Takip Kodunuz</p>
                <p className="text-3xl font-mono font-bold text-blue-600 tracking-wider">
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
    </div>
  );
}
