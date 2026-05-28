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
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Palette,
  Image,
  Shield,
  UserCheck,
  Package,
  LogIn,
  Lock,
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

const PRODUCTS = [
  { value: "ETHICS", label: "Etik İhbar", icon: Shield, desc: "Anonim ihbar yönetimi" },
  { value: "KVKK", label: "KVKK Başvuruları", icon: UserCheck, desc: "İlgili kişi başvuru yönetimi" },
  { value: "VENDOR_COMPLIANCE", label: "Tedarikçi Uyum", icon: Package, desc: "Tedarikçi risk ve uyum analizi" },
];

type Org = {
  id: string;
  name: string;
  slug: string;
  domain: string;
  emailDomain: string;
  plan: string;
  products: string[];
  billingPeriod: string;
  planStartDate: string | null;
  planEndDate: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  slaAcknowledgeDays: number;
  slaResolveDays: number;
  createdAt: string;
  _count: { users: number; reports: number };
};

function generatePassword(length = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let pw = "";
  for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
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

  // Edit state
  const [editOrg, setEditOrg] = useState<Org | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Delete state
  const [deleteOrg, setDeleteOrg] = useState<Org | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Impersonate state
  const [impersonateOrg, setImpersonateOrg] = useState<Org | null>(null);
  const [impersonatePassword, setImpersonatePassword] = useState("");
  const [impersonating, setImpersonating] = useState(false);
  const [impersonateError, setImpersonateError] = useState("");

  // Create form fields
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [plan, setPlan] = useState("ESSENTIAL");
  const [billingPeriod, setBillingPeriod] = useState("MONTHLY");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>(["ETHICS"]);

  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const fetchOrgs = useCallback(async () => {
    const res = await fetch("/api/admin/organizations");
    if (res.ok) setOrgs(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSuperAdmin) fetchOrgs();
    else setLoading(false);
  }, [isSuperAdmin, fetchOrgs]);

  if (!isSuperAdmin) { router.push("/dashboard"); return null; }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 50);
  }

  function handleOrgNameChange(val: string) {
    setOrgName(val);
    setSlug(autoSlug(val));
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
      body: JSON.stringify({ orgName, slug, domain, emailDomain, plan, billingPeriod, adminName, adminEmail, adminPassword, products: selectedProducts }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }

    setSuccess(`"${orgName}" başarıyla oluşturuldu!`);
    setSaving(false);
    setShowForm(false);
    setOrgName(""); setSlug(""); setDomain(""); setEmailDomain("");
    setPlan("ESSENTIAL"); setBillingPeriod("MONTHLY"); setSelectedProducts(["ETHICS"]);
    setAdminName(""); setAdminEmail(""); setAdminPassword("");
    fetchOrgs();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editOrg) return;
    setEditSaving(true);
    setError("");

    const res = await fetch(`/api/admin/organizations/${editOrg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editOrg.name,
        slug: editOrg.slug,
        domain: editOrg.domain,
        emailDomain: editOrg.emailDomain,
        plan: editOrg.plan,
        products: editOrg.products,
        billingPeriod: editOrg.billingPeriod,
        primaryColor: editOrg.primaryColor,
        secondaryColor: editOrg.secondaryColor,
        logoUrl: editOrg.logoUrl,
        slaAcknowledgeDays: editOrg.slaAcknowledgeDays,
        slaResolveDays: editOrg.slaResolveDays,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setEditSaving(false); return; }

    setSuccess(`"${editOrg.name}" başarıyla güncellendi!`);
    setEditOrg(null);
    setEditSaving(false);
    fetchOrgs();
  }

  async function handleDelete() {
    if (!deleteOrg || deleteConfirm !== deleteOrg.slug) return;
    setDeleting(true);
    setError("");

    const res = await fetch(`/api/admin/organizations/${deleteOrg.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setDeleting(false); return; }

    setSuccess(`"${deleteOrg.name}" başarıyla silindi.`);
    setDeleteOrg(null);
    setDeleteConfirm("");
    setDeleting(false);
    fetchOrgs();
  }

  async function handleImpersonate() {
    if (!impersonateOrg) return;
    setImpersonating(true);
    setImpersonateError("");

    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: impersonateOrg.id, password: impersonatePassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setImpersonateError(data.error);
      setImpersonating(false);
      return;
    }

    setImpersonateOrg(null);
    setImpersonatePassword("");
    setImpersonating(false);
    router.push("/dashboard");
    router.refresh();
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
          <p className="page-subtitle">Müşteri hesaplarını oluşturun ve yönetin</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditOrg(null); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Yeni Organizasyon
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-[13px] mb-4">{error}</div>}
      {success && <div className="bg-brand-50 text-brand-700 p-3 rounded-lg text-[13px] mb-4">{success}</div>}

      {/* ─── CREATE FORM ─── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-600" /> Yeni Organizasyon & Admin Oluştur
            </h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Müşterinin hesabını oluşturun ve yetkilendirin.</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Şirket Bilgileri</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Şirket Adı</label>
                    <input value={orgName} onChange={(e) => handleOrgNameChange(e.target.value)} placeholder="Örnek A.Ş." required className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Slug (URL)</label>
                    <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ornek-as" required className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                    <p className="text-[11px] text-gray-400 mt-1">/report/{slug || "..."}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Domain</label>
                    <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="ornek.com" required className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Mail Uzantısı (Doğrulama)</label>
                    <input value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} placeholder="ornek.com" required className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">Plan</label>
                  <div className="flex gap-3">
                    {PLANS.map((p) => (
                      <button key={p.value} type="button" onClick={() => setPlan(p.value)}
                        className={`flex-1 p-3.5 rounded-xl border-2 text-left transition-all ${plan === p.value ? `${p.color} border-brand-500` : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                        <p className="font-semibold text-[13px]">{p.label}</p>
                        <p className="text-[11px] text-gray-500">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">Faturalandırma Dönemi</label>
                  <div className="flex gap-3">
                    {BILLING_PERIODS.map((bp) => (
                      <button key={bp.value} type="button" onClick={() => setBillingPeriod(bp.value)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 text-[13px] font-medium transition-all ${billingPeriod === bp.value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        <Calendar className="h-4 w-4" /> {bp.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    <Package className="h-4 w-4 inline mr-1" />Ürün Paketleri
                  </label>
                  <div className="flex gap-3">
                    {PRODUCTS.map((p) => {
                      const selected = selectedProducts.includes(p.value);
                      return (
                        <button key={p.value} type="button"
                          onClick={() => {
                            setSelectedProducts((prev) =>
                              selected ? prev.filter((x) => x !== p.value) : [...prev, p.value]
                            );
                          }}
                          className={`flex-1 p-3.5 rounded-xl border-2 text-left transition-all ${selected ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <p.icon className={`h-4 w-4 ${selected ? "text-brand-600" : "text-gray-400"}`} />
                            <p className="font-semibold text-[13px]">{p.label}</p>
                          </div>
                          <p className="text-[11px] text-gray-500">{p.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Şirket Yetkilisi (Admin)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ad Soyad</label>
                    <input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Ahmet Yılmaz" required className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">E-posta</label>
                    <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder={`admin@${emailDomain || "ornek.com"}`} required className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Şifre</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type={showPassword ? "text" : "password"} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="En az 8 karakter" minLength={8} required className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <button type="button" onClick={() => setAdminPassword(generatePassword())} className="flex items-center gap-1.5 px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shrink-0">
                      <RefreshCw className="h-4 w-4" /> Rastgele
                    </button>
                    {adminPassword && (
                      <button type="button" onClick={copyPassword} className="flex items-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 shrink-0">
                        {copied ? <Check className="h-4 w-4 text-brand-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">İptal</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50">
                  {saving ? "Oluşturuluyor..." : "Organizasyon Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT MODAL ─── */}
      {editOrg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setEditOrg(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-[16px] font-semibold text-gray-900 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-brand-600" /> Organizasyonu Düzenle
              </h3>
              <button onClick={() => setEditOrg(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEdit} className="p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Şirket Adı</label>
                  <input value={editOrg.name} onChange={(e) => setEditOrg({ ...editOrg, name: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Slug (URL)</label>
                  <input value={editOrg.slug} onChange={(e) => setEditOrg({ ...editOrg, slug: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Domain</label>
                  <input value={editOrg.domain} onChange={(e) => setEditOrg({ ...editOrg, domain: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Mail Uzantısı</label>
                  <input value={editOrg.emailDomain || ""} onChange={(e) => setEditOrg({ ...editOrg, emailDomain: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
              </div>

              {/* Plan */}
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-2">Plan</label>
                <div className="flex gap-3">
                  {PLANS.map((p) => (
                    <button key={p.value} type="button" onClick={() => setEditOrg({ ...editOrg, plan: p.value })}
                      className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${editOrg.plan === p.value ? `${p.color} border-brand-500` : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                      <p className="font-semibold text-[13px]">{p.label}</p>
                      <p className="text-[11px] text-gray-500">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing */}
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-2">Faturalandırma Dönemi</label>
                <div className="flex gap-3">
                  {BILLING_PERIODS.map((bp) => (
                    <button key={bp.value} type="button" onClick={() => setEditOrg({ ...editOrg, billingPeriod: bp.value })}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 text-[13px] font-medium transition-all ${editOrg.billingPeriod === bp.value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600"}`}>
                      <Calendar className="h-4 w-4" /> {bp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products */}
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-2">Ürün Paketleri</label>
                <div className="flex gap-3">
                  {PRODUCTS.map((p) => {
                    const selected = (editOrg.products || []).includes(p.value);
                    return (
                      <button key={p.value} type="button"
                        onClick={() => {
                          const prods = editOrg.products || [];
                          setEditOrg({
                            ...editOrg,
                            products: selected ? prods.filter((x) => x !== p.value) : [...prods, p.value],
                          });
                        }}
                        className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${selected ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                        <div className="flex items-center gap-2">
                          <p.icon className={`h-4 w-4 ${selected ? "text-brand-600" : "text-gray-400"}`} />
                          <p className="font-semibold text-[13px]">{p.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Branding */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" /> Marka Ayarları
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Ana Renk</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={editOrg.primaryColor || "#059669"} onChange={(e) => setEditOrg({ ...editOrg, primaryColor: e.target.value })} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                      <input value={editOrg.primaryColor || "#059669"} onChange={(e) => setEditOrg({ ...editOrg, primaryColor: e.target.value })} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-500 mb-1.5">İkincil Renk</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={editOrg.secondaryColor || "#047857"} onChange={(e) => setEditOrg({ ...editOrg, secondaryColor: e.target.value })} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                      <input value={editOrg.secondaryColor || "#047857"} onChange={(e) => setEditOrg({ ...editOrg, secondaryColor: e.target.value })} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Logo URL</label>
                    <input value={editOrg.logoUrl || ""} onChange={(e) => setEditOrg({ ...editOrg, logoUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                </div>
              </div>

              {/* SLA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Onay SLA (gün)</label>
                  <input type="number" value={editOrg.slaAcknowledgeDays} onChange={(e) => setEditOrg({ ...editOrg, slaAcknowledgeDays: Number(e.target.value) })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Çözüm SLA (gün)</label>
                  <input type="number" value={editOrg.slaResolveDays} onChange={(e) => setEditOrg({ ...editOrg, slaResolveDays: Number(e.target.value) })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditOrg(null)} className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">İptal</button>
                <button type="submit" disabled={editSaving} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50">
                  {editSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {deleteOrg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => { setDeleteOrg(null); setDeleteConfirm(""); }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Organizasyonu Sil</h3>
              <p className="text-[13px] text-gray-500 mb-1">
                <strong>{deleteOrg.name}</strong> ve tüm verileri (kullanıcılar, ihbarlar, formlar) kalıcı olarak silinecektir.
              </p>
              <p className="text-[13px] text-gray-500 mb-4">
                {deleteOrg._count.users} kullanıcı · {deleteOrg._count.reports} ihbar
              </p>
              <div className="mb-4">
                <p className="text-[12px] text-gray-500 mb-1.5">
                  Onaylamak için <strong className="text-red-600">{deleteOrg.slug}</strong> yazın:
                </p>
                <input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={deleteOrg.slug}
                  className="w-full px-3 py-2.5 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setDeleteOrg(null); setDeleteConfirm(""); }} className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">İptal</button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirm !== deleteOrg.slug || deleting}
                  className="flex-1 px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {deleting ? "Siliniyor..." : "Kalıcı Olarak Sil"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── IMPERSONATE MODAL ─── */}
      {impersonateOrg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => { setImpersonateOrg(null); setImpersonatePassword(""); setImpersonateError(""); }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">Panele Bağlan</h3>
              <p className="text-[13px] text-gray-500 mb-5 text-center">
                <strong>{impersonateOrg.name}</strong> paneline destek modu ile bağlanacaksınız.
              </p>
              {impersonateError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-[13px] mb-4">{impersonateError}</div>
              )}
              <div className="mb-5">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  <Lock className="h-3.5 w-3.5 inline mr-1" />
                  Destek Şifresi
                </label>
                <input
                  type="password"
                  value={impersonatePassword}
                  onChange={(e) => setImpersonatePassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleImpersonate()}
                  placeholder="Şifreyi girin"
                  autoFocus
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-center tracking-widest font-mono"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setImpersonateOrg(null); setImpersonatePassword(""); setImpersonateError(""); }} className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                  İptal
                </button>
                <button
                  onClick={handleImpersonate}
                  disabled={impersonating || !impersonatePassword}
                  className="flex-1 px-4 py-2.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 font-medium"
                >
                  {impersonating ? "Bağlanıyor..." : "Bağlan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ORGANIZATIONS TABLE ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="section-title">Tüm Organizasyonlar ({orgs.length})</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : orgs.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Henüz organizasyon yok</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full data-table min-w-[700px]">
            <thead>
              <tr>
                <th>Organizasyon</th>
                <th>Plan</th>
                <th>Ürünler</th>
                <th>Dönem</th>
                <th>Bitiş Tarihi</th>
                <th>Kullanıcı</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {org.logoUrl ? (
                        <img src={org.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: org.primaryColor || "#059669" }}>
                          {org.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{org.name}</p>
                        <p className="text-[11px] text-gray-400">{org.slug} · {org.domain}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${planBadges[org.plan] || "bg-gray-100 text-gray-600"}`}>
                      {org.plan}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {(org.products || ["ETHICS"]).map((p) => (
                        <span key={p} className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${p === "ETHICS" ? "bg-brand-50 text-brand-700" : p === "KVKK" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"}`}>
                          {p === "ETHICS" ? "Etik" : p === "KVKK" ? "KVKK" : "Tedarikçi"}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-[13px] text-gray-500">{org.billingPeriod === "YEARLY" ? "Yıllık" : "Aylık"}</td>
                  <td className="text-[13px] text-gray-500">
                    {org.planEndDate ? (
                      <span className={new Date(org.planEndDate) < new Date() ? "text-red-500 font-medium" : ""}>
                        {new Date(org.planEndDate).toLocaleDateString("tr-TR")}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td>
                    <span className="flex items-center gap-1 text-[13px] text-gray-600"><Users className="h-3.5 w-3.5" />{org._count.users}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {org.slug !== "ethicall" && (
                        <button onClick={() => { setImpersonateOrg(org); setImpersonateError(""); }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Panele Bağlan">
                          <LogIn className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => { setEditOrg(org); setShowForm(false); setError(""); }} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Düzenle">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {org.slug !== "ethicall" && (
                        <button onClick={() => { setDeleteOrg(org); setError(""); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Sil">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
