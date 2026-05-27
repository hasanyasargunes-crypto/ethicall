"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Shield, CheckCircle, AlertCircle, Globe } from "lucide-react";
import { KVKK_RIGHT_LABELS } from "@/lib/kvkk-constants";

type FormField = {
  id: string;
  label_tr: string;
  label_en: string;
  type: string;
  required: boolean;
  options?: string[];
};

type FormTemplate = {
  id: string;
  name: string;
  fields: FormField[];
  description: string | null;
  locale: string;
  organization: {
    name: string;
    primaryColor: string | null;
    logoUrl: string | null;
  };
};

const KVKK_RIGHTS = Object.entries(KVKK_RIGHT_LABELS);

export default function PublicKVKKFormPage() {
  const { token } = useParams();
  const [form, setForm] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locale, setLocale] = useState("tr");
  const [submitted, setSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form values
  const [applicantName, setApplicantName] = useState("");
  const [applicantSurname, setApplicantSurname] = useState("");
  const [applicantTCKN, setApplicantTCKN] = useState("");
  const [applicantAddress, setApplicantAddress] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [rightType, setRightType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isProxy, setIsProxy] = useState(false);
  const [proxyName, setProxyName] = useState("");

  useEffect(() => {
    fetch(`/api/public/kvkk-form/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Form bulunamadı");
        return r.json();
      })
      .then((data) => {
        setForm(data);
        setLocale(data.locale || "tr");
        setLoading(false);
      })
      .catch(() => {
        setError("Form bulunamadı veya yayında değil");
        setLoading(false);
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rightType) {
      setError(locale === "tr" ? "Lütfen talep ettiğiniz hakkı seçin" : "Please select the right you are requesting");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/kvkk/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgSlug: (form as any)?.orgSlug,
        applicantName,
        applicantSurname,
        applicantTCKN: applicantTCKN || undefined,
        applicantAddress,
        applicantEmail: applicantEmail || undefined,
        applicantPhone: applicantPhone || undefined,
        rightType,
        subject,
        description,
        isProxy,
        proxyName: isProxy ? proxyName : undefined,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setTrackingCode(data.trackingCode);
      setSubmitted(true);
    } else {
      setError(data.error || (locale === "tr" ? "Başvuru gönderilemedi" : "Failed to submit request"));
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

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{error || "Form bulunamadı"}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {locale === "tr" ? "Başvurunuz Alındı" : "Request Received"}
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              {locale === "tr"
                ? "Başvurunuz başarıyla iletildi. Takip kodunuz:"
                : "Your request has been submitted successfully. Your tracking code:"}
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="font-mono text-2xl font-bold text-emerald-700 tracking-wider">{trackingCode}</p>
            </div>
            <p className="text-[12px] text-gray-400">
              {locale === "tr"
                ? "6698 sayılı KVKK kapsamında başvurunuz en geç 30 gün içinde cevaplanacaktır."
                : "Your request will be answered within 30 days in accordance with KVKK Law No. 6698."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const brandColor = form.organization.primaryColor || "#059669";
  const t = locale === "tr";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            {form.organization.logoUrl ? (
              <img src={form.organization.logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>
                {form.organization.name[0]}
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-900">{form.organization.name}</h1>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            {t ? "İlgili Kişi Başvuru Formu" : "Data Subject Request Form"}
          </h2>
          <p className="text-[13px] text-gray-500">
            {t ? "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında başvuru formu" : "Data subject request form under KVKK Law No. 6698"}
          </p>
          {/* Language Toggle */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={() => setLocale("tr")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${locale === "tr" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Globe className="h-3 w-3" /> TR
            </button>
            <button
              onClick={() => setLocale("en")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${locale === "en" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Globe className="h-3 w-3" /> EN
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {error && (
            <div className="mx-6 mt-6 flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-[13px]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" style={{ color: brandColor }} />
              {t ? "Kişisel Bilgiler" : "Personal Information"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                  {t ? "Ad *" : "First Name *"}
                </label>
                <input
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                  {t ? "Soyad *" : "Last Name *"}
                </label>
                <input
                  required
                  value={applicantSurname}
                  onChange={(e) => setApplicantSurname(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                  {t ? "T.C. Kimlik No" : "National ID Number"}
                </label>
                <input
                  value={applicantTCKN}
                  onChange={(e) => setApplicantTCKN(e.target.value)}
                  placeholder={t ? "11 haneli" : "11 digits"}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                  {t ? "E-posta" : "Email"}
                </label>
                <input
                  type="email"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                  {t ? "Telefon" : "Phone"}
                </label>
                <input
                  type="tel"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                  {t ? "Adres *" : "Address *"}
                </label>
                <textarea
                  required
                  value={applicantAddress}
                  onChange={(e) => setApplicantAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Proxy */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isProxy}
                  onChange={(e) => setIsProxy(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                {t ? "Vekil aracılığıyla başvuruyorum" : "I am applying through a representative"}
              </label>
              {isProxy && (
                <input
                  value={proxyName}
                  onChange={(e) => setProxyName(e.target.value)}
                  placeholder={t ? "Vekil adı soyadı" : "Representative full name"}
                  className="mt-3 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              )}
            </div>
          </div>

          {/* Right Selection */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-1">
              {t ? "Talep Edilen Hak *" : "Requested Right *"}
            </h3>
            <p className="text-[12px] text-gray-500 mb-4">
              {t ? "KVKK Madde 11 kapsamında talebinizi seçin" : "Select your request under KVKK Article 11"}
            </p>
            <div className="space-y-2">
              {KVKK_RIGHTS.map(([key, labels]) => (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    rightType === key
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="rightType"
                    value={key}
                    checked={rightType === key}
                    onChange={(e) => setRightType(e.target.value)}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[13px] text-gray-700">
                    {t ? labels.tr : labels.en}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Request Details */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-4">
              {t ? "Başvuru Detayı" : "Request Details"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                  {t ? "Konu *" : "Subject *"}
                </label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t ? "Başvurunuzun kısa özeti" : "Brief summary of your request"}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                  {t ? "Detaylı Açıklama *" : "Detailed Description *"}
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder={t ? "Talebinizi detaylı olarak açıklayın..." : "Describe your request in detail..."}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="p-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: brandColor }}
            >
              {submitting
                ? (t ? "Gönderiliyor..." : "Submitting...")
                : (t ? "Başvuruyu Gönder" : "Submit Request")}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              {t
                ? "Bu başvuru 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenecektir."
                : "This request will be processed under KVKK Law No. 6698."}
            </p>
          </div>
        </form>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Powered by EthicAll
        </p>
      </div>
    </div>
  );
}
