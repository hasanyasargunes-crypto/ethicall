"use client";

import { useState, useEffect, use } from "react";
import {
  Building2, ClipboardList, FileText, ChevronRight, CheckCircle2,
  ShieldCheck, ShieldAlert, AlertCircle, Upload,
} from "lucide-react";

type PortalData = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  status: string;
  organization: { name: string; logoUrl: string | null; primaryColor: string | null };
  surveys: {
    id: string;
    status: string;
    expiresAt: string;
    template: { name: string; description: string | null; questions: any[] };
  }[];
  documents: { id: string; name: string; documentType: string; expiryDate: string | null }[];
};

export default function VendorPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ score: number; level: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/vendor-portal/${token}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError("Portal bulunamadı"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(surveyId: string) {
    setSubmitting(true);
    const res = await fetch(`/api/public/vendor-portal/${token}/survey/${surveyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses }),
    });
    const result = await res.json();
    if (res.ok) {
      setSubmitted(result);
      setActiveSurvey(null);
    } else {
      alert(result.error || "Gönderme başarısız");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">{error || "Portal bulunamadı"}</p>
        </div>
      </div>
    );
  }

  const brandColor = data.organization.primaryColor || "#059669";

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4" style={{ color: brandColor }} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Anket Tamamlandı</h1>
          <p className="text-gray-500 mb-4">Cevaplarınız başarıyla kaydedildi. Teşekkür ederiz.</p>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Uyum Puanınız</p>
            <p className="text-4xl font-bold mt-1" style={{ color: brandColor }}>%{submitted.score}</p>
          </div>
        </div>
      </div>
    );
  }

  // Survey filling screen
  if (activeSurvey) {
    const survey = data.surveys.find((s) => s.id === activeSurvey);
    if (!survey) return null;
    const questions = survey.template.questions as any[];

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 py-4 px-6">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: brandColor }}>
              {data.organization.name[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{survey.template.name}</p>
              <p className="text-xs text-gray-400">{data.organization.name} - {data.companyName}</p>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {survey.template.description && (
            <p className="text-sm text-gray-500 mb-6">{survey.template.description}</p>
          )}

          <div className="space-y-4">
            {questions.map((q: any, idx: number) => (
              <div key={q.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-sm font-medium text-gray-900 mb-3">
                  <span className="text-gray-400 mr-2">{idx + 1}.</span>
                  {q.text_tr}
                </p>
                {q.text_en && <p className="text-xs text-gray-400 mb-3">{q.text_en}</p>}

                {q.type === "yes_no" && (
                  <div className="flex gap-3">
                    {[
                      { value: "yes", label: "Evet" },
                      { value: "no", label: "Hayır" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setResponses({ ...responses, [q.id]: opt.value })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          responses[q.id] === opt.value
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === "select" && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt: any) => (
                      <button
                        key={opt.value}
                        onClick={() => setResponses({ ...responses, [q.id]: opt.value })}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-colors ${
                          responses[q.id] === opt.value
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label_tr}
                        {opt.label_en && <span className="text-xs text-gray-400 ml-2">({opt.label_en})</span>}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === "text" && (
                  <textarea
                    value={responses[q.id] || ""}
                    onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>İlerleme</span>
              <span>{Object.keys(responses).length} / {questions.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(Object.keys(responses).length / questions.length) * 100}%`,
                  backgroundColor: brandColor,
                }}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => { setActiveSurvey(null); setResponses({}); }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Geri Dön
            </button>
            <button
              onClick={() => handleSubmit(activeSurvey)}
              disabled={submitting || Object.keys(responses).length < questions.length}
              className="px-6 py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50"
              style={{ backgroundColor: brandColor }}
            >
              {submitting ? "Gönderiliyor..." : "Anketi Gönder"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Portal home
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 py-6 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>
              {data.organization.name[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{data.organization.name}</p>
              <p className="text-sm text-gray-500">Tedarikçi Uyum Portalı</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{data.companyName}</p>
                <p className="text-sm text-gray-500">{data.contactName} - {data.contactEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Pending Surveys */}
        {data.surveys.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" style={{ color: brandColor }} />
              Doldurulması Gereken Anketler
            </h2>
            <div className="space-y-3">
              {data.surveys.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSurvey(s.id)}
                  className="w-full bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:border-gray-200 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-gray-900">{s.template.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Son tarih: {new Date(s.expiresAt).toLocaleDateString("tr-TR")}
                      {" | "}{(s.template.questions as any[]).length} soru
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {data.surveys.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <ShieldCheck className="h-12 w-12 mx-auto mb-3" style={{ color: brandColor }} />
            <p className="text-gray-600 font-medium">Tüm anketler tamamlandı</p>
            <p className="text-sm text-gray-400 mt-1">Şu anda bekleyen bir anketiniz bulunmamakta</p>
          </div>
        )}

        {/* Documents */}
        {data.documents.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" style={{ color: brandColor }} />
              Yüklü Belgeler
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {data.documents.map((d) => (
                <div key={d.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.documentType}</p>
                  </div>
                  {d.expiryDate && (
                    <span className="text-xs text-gray-400">
                      {new Date(d.expiryDate).toLocaleDateString("tr-TR")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        EthicAll Tedarikçi Uyum Portalı
      </footer>
    </div>
  );
}
