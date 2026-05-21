"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Calendar,
  Users,
  FileText,
  ArrowUpRight,
} from "lucide-react";

const PLANS = [
  { value: "ESSENTIAL", label: "Essential", desc: "0-100 çalışan", color: "border-blue-200 bg-blue-50" },
  { value: "SHIELD", label: "Shield", desc: "100-250 çalışan", color: "border-emerald-200 bg-emerald-50" },
  { value: "VAULT", label: "Vault", desc: "250+ çalışan", color: "border-purple-200 bg-purple-50" },
];

const BILLING_PERIODS = [
  { value: "MONTHLY", label: "Aylık" },
  { value: "YEARLY", label: "Yıllık" },
];

type Org = {
  id: string;
  name: string;
  slug: string;
  domain: string;
  emailDomain: string;
  plan: string;
  billingPeriod: string;
  planStartDate: string | null;
  planEndDate: string | null;
  createdAt: string;
  _count: { users: number; reports: number };
};

function generatePassword(length = 16) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [plan, setPlan] = useState("ESSENTIAL");
  const [billingPeriod, setBillingPeriod] = useState("MONTHLY");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const fetchOrgs = useCallback(async () => {
    const res = await fetch("/api/admin/organizations");
    if (res.ok) {
      const data = await res.json();
      setOrgs(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSuperAdmin) fetchOrgs();
    else setLoading(false);
  }, [isSuperAdmin, fetchOrgs]);

  if (!isSuperAdmin) {
    router.push("/dashboard");
    return null;
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);
  }

  function handleOrgNameChange(val: string) {
    setOrgName(val);
    setSlug(autoSlug(val));
  }

  function handleEmailDomainChange(val: string) {
    setEmailDomain(val);
    if (adminEmail) {
      const localPart = adminEmail.split("@")[0];
      setAdminEmail(`${localPart}@${val}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const adminDomain = adminEmail.split("@")[1];
    if (adminDomain !== emailDomain) {
      setError(`Admin e-posta uzantısı (${adminDomain}) şirket mail uzantısı (${emailDomain}) ile eşleşmeli`);
      setSaving(false);
      return;
    }

    const res = await fetch("/api/admin/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgName, slug, domain, emailDomain, plan, billingPeriod,
        adminName, adminEmail, adminPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setSaving(false);
      return;
    }

    setSuccess(`"${orgName}" başarıyla oluşturuldu!`);
    setSaving(false);
    setShowForm(false);
    setOrgName(""); setSlug(""); setDomain(""); setEmailDomain("");
    setPlan("ESSENTIAL"); setBillingPeriod("MONTHLY");
    setAdminName(""); setAdminEmail(""); setAdminPassword("");
    fetchOrgs();
  }

  function copyPassword() {
    navigator.clipboard.writeText(adminPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const planBadges: Record<string, string> = {
    TRIAL: "bg-gray-100 text-gray-600",
    ESSENTIAL: "bg-blue-50 text-blue-700",
    SHIELD: "bg-emerald-50 text-emerald-700",
    VAULT: "bg-purple-50 text-purple-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Organizasyonlar</h1>
          <p className="page-subtitle">
            Müşteri hesaplarını oluşturun ve yönetin
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Organizasyon
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-[13px] mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-brand-50 text-brand-700 p-3 rounded-lg text-[13px] mb-4">
          {success}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-600" />
              Yeni Organizasyon & Admin Oluştur
            </h3>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Müşterinin hesabını oluşturun ve yetkilendirin.
            </p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Org Info */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
                  Şirket Bilgileri
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      Şirket Adı
                    </label>
                    <input
                      value={orgName}
                      onChange={(e) => handleOrgNameChange(e.target.value)}
                      placeholder="Örnek A.Ş."
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      Slug (URL)
                    </label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="ornek-as"
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      /report/{slug || "..."}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      Domain
                    </label>
                    <input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="ornek.com"
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      Mail Uzantısı (Doğrulama)
                    </label>
                    <input
                      value={emailDomain}
                      onChange={(e) => handleEmailDomainChange(e.target.value)}
                      placeholder="ornek.com"
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Plan */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    Plan
                  </label>
                  <div className="flex gap-3">
                    {PLANS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPlan(p.value)}
                        className={`flex-1 p-3.5 rounded-xl border-2 text-left transition-all ${
                          plan === p.value
                            ? `${p.color} border-brand-500`
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <p className="font-semibold text-[13px]">{p.label}</p>
                        <p className="text-[11px] text-gray-500">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Billing Period */}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    Faturalandırma Dönemi
                  </label>
                  <div className="flex gap-3">
                    {BILLING_PERIODS.map((bp) => (
                      <button
                        key={bp.value}
                        type="button"
                        onClick={() => setBillingPeriod(bp.value)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 text-[13px] font-medium transition-all ${
                          billingPeriod === bp.value
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                        {bp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin Info */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
                  Şirket Yetkilisi (Admin)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      Ad Soyad
                    </label>
                    <input
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Ahmet Yılmaz"
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder={`admin@${emailDomain || "ornek.com"}`}
                      required
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    {adminEmail && emailDomain && adminEmail.split("@")[1] !== emailDomain && (
                      <p className="text-[11px] text-red-500 mt-1">
                        Mail uzantısı şirket domaini ile eşleşmeli!
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Şifre
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="En az 8 karakter"
                        minLength={8}
                        required
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminPassword(generatePassword())}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shrink-0"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Rastgele
                    </button>
                    {adminPassword && (
                      <button
                        type="button"
                        onClick={copyPassword}
                        className="flex items-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 shrink-0"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-brand-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {saving ? "Oluşturuluyor..." : "Organizasyon Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organizations List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="section-title">
            Tüm Organizasyonlar ({orgs.length})
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : orgs.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Henüz organizasyon yok
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Organizasyon</th>
                <th>Plan</th>
                <th>Dönem</th>
                <th>Bitiş Tarihi</th>
                <th>Kullanıcı</th>
                <th>İhbar</th>
                <th>Kayıt</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id}>
                  <td>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">
                        {org.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {org.slug} · {org.domain}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        planBadges[org.plan] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {org.plan}
                    </span>
                  </td>
                  <td className="text-[13px] text-gray-500">
                    {org.billingPeriod === "YEARLY" ? "Yıllık" : "Aylık"}
                  </td>
                  <td className="text-[13px] text-gray-500">
                    {org.planEndDate ? (
                      <span
                        className={
                          new Date(org.planEndDate) < new Date()
                            ? "text-red-500 font-medium"
                            : ""
                        }
                      >
                        {new Date(org.planEndDate).toLocaleDateString("tr-TR")}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td>
                    <span className="flex items-center gap-1 text-[13px] text-gray-600">
                      <Users className="h-3.5 w-3.5" />
                      {org._count.users}
                    </span>
                  </td>
                  <td>
                    <span className="flex items-center gap-1 text-[13px] text-gray-600">
                      <FileText className="h-3.5 w-3.5" />
                      {org._count.reports}
                    </span>
                  </td>
                  <td className="text-[13px] text-gray-400">
                    {new Date(org.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
