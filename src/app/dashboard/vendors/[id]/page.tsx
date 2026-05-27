"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Building2, Mail, Phone, ShieldCheck, ShieldAlert, ShieldX, ShieldOff,
  FileText, ClipboardList, Plus, AlertTriangle, CalendarClock, ExternalLink, Copy,
} from "lucide-react";
import { VENDOR_STATUS_CONFIG, RISK_LEVEL_CONFIG, SURVEY_STATUS_CONFIG, DOCUMENT_TYPES } from "@/lib/vendor-constants";

type Survey = {
  id: string;
  status: string;
  riskScore: number | null;
  riskLevel: string | null;
  sentAt: string;
  completedAt: string | null;
  expiresAt: string;
  template: { name: string };
};

type Document = {
  id: string;
  name: string;
  documentType: string;
  expiryDate: string | null;
  createdAt: string;
};

type VendorDetail = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  taxId: string | null;
  address: string | null;
  sector: string | null;
  notes: string | null;
  status: string;
  overallRiskScore: number | null;
  riskLevel: string | null;
  portalToken: string;
  createdAt: string;
  surveys: Survey[];
  documents: Document[];
  _count: { surveys: number; documents: number };
};

const riskIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  LOW: ShieldCheck, MEDIUM: ShieldAlert, HIGH: ShieldX, CRITICAL: ShieldOff,
};

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchVendor(); fetchTemplates(); }, []);

  async function fetchVendor() {
    const res = await fetch(`/api/vendors/${id}`);
    if (res.ok) setVendor(await res.json());
    setLoading(false);
  }

  async function fetchTemplates() {
    const res = await fetch("/api/vendors/survey-templates");
    if (res.ok) setTemplates(await res.json());
  }

  async function assignSurvey() {
    setAssigning(true);
    const res = await fetch(`/api/vendors/${id}/surveys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: selectedTemplate, expiresInDays: 30 }),
    });
    if (res.ok) {
      setShowAssignModal(false);
      setSelectedTemplate("");
      fetchVendor();
    }
    setAssigning(false);
  }

  function copyPortalLink() {
    if (!vendor) return;
    const url = `${window.location.origin}/vendor-portal/${vendor.portalToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!vendor) {
    return <div className="text-center py-20 text-gray-500">Tedarikci bulunamadi</div>;
  }

  const statusConf = VENDOR_STATUS_CONFIG[vendor.status];
  const riskConf = vendor.riskLevel ? RISK_LEVEL_CONFIG[vendor.riskLevel] : null;
  const RiskIcon = vendor.riskLevel ? riskIcons[vendor.riskLevel] : ShieldAlert;

  // Check for expiring documents
  const now = new Date();
  const expiringDocs = vendor.documents.filter((d) => {
    if (!d.expiryDate) return false;
    const exp = new Date(d.expiryDate);
    const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 90 && daysLeft > 0;
  });
  const expiredDocs = vendor.documents.filter((d) => d.expiryDate && new Date(d.expiryDate) <= now);

  return (
    <div>
      {/* Back */}
      <Link href="/dashboard/vendors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Tedarikciler
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{vendor.companyName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConf?.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConf?.dot}`} />
                  {statusConf?.label}
                </span>
                {vendor.sector && <span className="text-xs text-gray-400">{vendor.sector}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyPortalLink}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Kopyalandi!" : "Portal Linki"}
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700"
          >
            <ClipboardList className="h-4 w-4" />
            Anket Ata
          </button>
        </div>
      </div>

      {/* Risk Score Card + Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Risk Score */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center justify-center">
          {vendor.overallRiskScore !== null && riskConf ? (
            <>
              <RiskIcon className={`h-10 w-10 mb-2 ${riskConf.color}`} />
              <p className="text-3xl font-bold text-gray-900">%{vendor.overallRiskScore}</p>
              <p className={`text-sm font-medium ${riskConf.color}`}>{riskConf.label}</p>
              <p className="text-xs text-gray-400 mt-1">Uyum Puani</p>
            </>
          ) : (
            <>
              <ShieldAlert className="h-10 w-10 mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">Henuz puanlanmadi</p>
              <p className="text-xs text-gray-400">Anket atayarak puanlayin</p>
            </>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Iletisim Bilgileri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              {vendor.contactEmail}
            </div>
            {vendor.contactPhone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                {vendor.contactPhone}
              </div>
            )}
            <div className="text-gray-600"><span className="text-gray-400">Ilgili Kisi:</span> {vendor.contactName}</div>
            {vendor.taxId && <div className="text-gray-600"><span className="text-gray-400">Vergi No:</span> {vendor.taxId}</div>}
            {vendor.address && <div className="text-gray-600 col-span-2"><span className="text-gray-400">Adres:</span> {vendor.address}</div>}
          </div>
          {vendor.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Notlar</p>
              <p className="text-sm text-gray-600">{vendor.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {(expiringDocs.length > 0 || expiredDocs.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium text-sm">
              {expiredDocs.length > 0 && `${expiredDocs.length} belgenin suresi dolmus. `}
              {expiringDocs.length > 0 && `${expiringDocs.length} belgenin suresi dolmak uzere.`}
            </span>
          </div>
        </div>
      )}

      {/* Surveys */}
      <div className="bg-white rounded-xl border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Uyum Anketleri</h3>
          <span className="text-xs text-gray-400">{vendor.surveys.length} anket</span>
        </div>
        {vendor.surveys.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Henuz anket atanmamis</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {vendor.surveys.map((s) => {
              const sConf = SURVEY_STATUS_CONFIG[s.status];
              return (
                <div key={s.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.template.name}</p>
                    <p className="text-xs text-gray-400">
                      Gonderildi: {new Date(s.sentAt).toLocaleDateString("tr-TR")}
                      {s.completedAt && ` | Tamamlandi: ${new Date(s.completedAt).toLocaleDateString("tr-TR")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.riskScore !== null && (
                      <span className="text-sm font-medium text-gray-700">%{s.riskScore}</span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sConf?.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sConf?.dot}`} />
                      {sConf?.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Belgeler</h3>
          <span className="text-xs text-gray-400">{vendor.documents.length} belge</span>
        </div>
        {vendor.documents.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Henuz belge yuklenmemis</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {vendor.documents.map((d) => {
              const docType = DOCUMENT_TYPES.find((t) => t.value === d.documentType);
              const isExpired = d.expiryDate && new Date(d.expiryDate) <= now;
              const isExpiring = d.expiryDate && !isExpired && new Date(d.expiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
              return (
                <div key={d.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-400">{docType?.label || d.documentType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.expiryDate && (
                      <span className={`text-xs ${isExpired ? "text-red-600 font-medium" : isExpiring ? "text-amber-600" : "text-gray-400"}`}>
                        <CalendarClock className="h-3.5 w-3.5 inline mr-1" />
                        {isExpired ? "Suresi dolmus" : new Date(d.expiryDate).toLocaleDateString("tr-TR")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Survey Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Anket Ata</h2>
              <p className="text-sm text-gray-500 mt-1">{vendor.companyName} icin anket secin</p>
            </div>
            <div className="p-6">
              {templates.length === 0 ? (
                <p className="text-sm text-gray-400">Once bir anket sablonu olusturun.</p>
              ) : (
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Sablon seciniz</option>
                  {templates.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Iptal</button>
              <button
                onClick={assignSurvey}
                disabled={assigning || !selectedTemplate}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                {assigning ? "Ataniyor..." : "Anket Gonder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
