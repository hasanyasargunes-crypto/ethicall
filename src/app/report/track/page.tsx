"use client";

import { useState } from "react";
import { Shield, Lock, Search, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: "Yeni", color: "bg-blue-100 text-blue-700" },
  ACKNOWLEDGED: { label: "Onaylandı", color: "bg-yellow-100 text-yellow-700" },
  UNDER_REVIEW: { label: "İnceleniyor", color: "bg-purple-100 text-purple-700" },
  INVESTIGATING: { label: "Soruşturuluyor", color: "bg-orange-100 text-orange-700" },
  RESOLVED: { label: "Çözüldü", color: "bg-green-100 text-green-700" },
  CLOSED: { label: "Kapatıldı", color: "bg-gray-100 text-gray-700" },
  DISMISSED: { label: "Reddedildi", color: "bg-red-100 text-red-700" },
};

type ReportData = {
  id: string;
  trackingCode: string;
  title: string;
  status: string;
  severity: string;
  category: { name_tr: string; name_en: string };
  organization: { name: string };
  messages: { id: string; content: string; senderType: string; createdAt: string }[];
  createdAt: string;
};

export default function TrackPage() {
  const [code, setCode] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrack() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCode: code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setReport(null);
    } else {
      setReport(data);
    }
    setLoading(false);
  }

  async function sendMessage() {
    if (!report || !message.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/track/${report.trackingCode}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
    if (res.ok) {
      setMessage("");
      handleTrack();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">EthicAll</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-700">
          <Lock className="h-4 w-4 shrink-0" />
          <span>Bu sayfa güvenlidir. Kimliğiniz gizli tutulmaktadır.</span>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              İhbar Takibi
            </CardTitle>
            <CardDescription>Takip kodunuzu girerek ihbarınızın durumunu sorgulayın.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ETH-XXXXXXXX"
                className="font-mono text-lg"
              />
              <Button onClick={handleTrack} disabled={!code || loading}>
                {loading ? "Aranıyor..." : "Sorgula"}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        {report && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{report.title}</CardTitle>
                  <Badge className={STATUS_LABELS[report.status]?.color}>
                    {STATUS_LABELS[report.status]?.label}
                  </Badge>
                </div>
                <CardDescription>
                  {report.category.name_tr} &middot; {report.organization.name} &middot;{" "}
                  {new Date(report.createdAt).toLocaleDateString("tr-TR")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5" />
                  Mesajlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {report.messages.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Henüz mesaj yok.</p>
                  )}
                  {report.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.senderType === "REPORTER"
                          ? "bg-blue-50 ml-8"
                          : msg.senderType === "SYSTEM"
                          ? "bg-gray-50 text-center text-sm"
                          : "bg-gray-100 mr-8"
                      }`}
                    >
                      <p className="text-xs text-gray-500 mb-1">
                        {msg.senderType === "REPORTER"
                          ? "Siz"
                          : msg.senderType === "SYSTEM"
                          ? "Sistem"
                          : "Etik Ekip"}{" "}
                        &middot; {new Date(msg.createdAt).toLocaleString("tr-TR")}
                      </p>
                      <p>{msg.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!message.trim() || loading} size="icon" className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
