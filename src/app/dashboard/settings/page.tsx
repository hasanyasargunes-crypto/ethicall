"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Mail, Lock, Check, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"email" | "password" | "support">("email");

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState<"input" | "verify">("input");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Support access
  const [supportAccess, setSupportAccess] = useState(true);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState("");

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/settings/support-access")
        .then((r) => r.json())
        .then((d) => {
          if (d.allowSupportAccess !== undefined) setSupportAccess(d.allowSupportAccess);
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  async function handleToggleSupportAccess() {
    setSupportLoading(true);
    setSupportSuccess("");
    const res = await fetch("/api/settings/support-access", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowSupportAccess: !supportAccess }),
    });
    if (res.ok) {
      const data = await res.json();
      setSupportAccess(data.allowSupportAccess);
      setSupportSuccess(data.allowSupportAccess ? "Destek erişimi açıldı" : "Destek erişimi kapatıldı");
    }
    setSupportLoading(false);
  }

  async function handleSendEmailOtp() {
    setEmailLoading(true);
    setEmailError("");
    const res = await fetch("/api/settings/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send_otp", newEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEmailError(data.error);
    } else {
      setEmailStep("verify");
      if (data.demoCode) {
        setEmailOtp(data.demoCode);
      }
    }
    setEmailLoading(false);
  }

  async function handleVerifyEmailOtp() {
    setEmailLoading(true);
    setEmailError("");
    const res = await fetch("/api/settings/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify_otp", newEmail, otp: emailOtp }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEmailError(data.error);
    } else {
      setEmailSuccess("E-posta adresiniz başarıyla güncellendi. Yeniden giriş yapmanız gerekiyor.");
      setEmailStep("input");
      setNewEmail("");
      setEmailOtp("");
    }
    setEmailLoading(false);
  }

  async function handleChangePassword() {
    setPwError("");
    if (newPassword.length < 8) {
      setPwError("Yeni şifre en az 8 karakter olmalıdır");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Şifreler eşleşmiyor");
      return;
    }
    setPwLoading(true);
    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPwError(data.error);
    } else {
      setPwSuccess("Şifreniz başarıyla güncellendi.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPwLoading(false);
  }

  const tabs = [
    { key: "email" as const, label: "E-posta Değiştir", icon: Mail },
    { key: "password" as const, label: "Şifre Değiştir", icon: Lock },
    ...(isAdmin ? [{ key: "support" as const, label: "Destek Erişimi", icon: ShieldCheck }] : []),
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">Hesap Ayarları</h1>
        <p className="page-subtitle">
          E-posta ve şifre bilgilerinizi güncelleyin
        </p>
      </div>

      {/* Current Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-lg font-bold">
            {(session?.user?.name || "")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-900">
              {session?.user?.name}
            </p>
            <p className="text-[13px] text-gray-500">{session?.user?.email}</p>
            <p className="text-[12px] text-gray-400">
              {(session?.user as any)?.organizationName}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setEmailError("");
              setPwError("");
              setEmailSuccess("");
              setPwSuccess("");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-brand-50 text-brand-700 border border-brand-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {activeTab === "email" && (
          <div className="max-w-md">
            <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
              E-posta Adresini Değiştir
            </h3>
            <p className="text-[13px] text-gray-500 mb-5">
              Yeni e-posta adresinize bir doğrulama kodu gönderilecektir.
            </p>

            {emailSuccess && (
              <div className="flex items-center gap-2 bg-brand-50 text-brand-700 p-3 rounded-lg text-[13px] mb-4">
                <Check className="h-4 w-4 shrink-0" />
                {emailSuccess}
              </div>
            )}
            {emailError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-[13px] mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {emailError}
              </div>
            )}

            {emailStep === "input" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Yeni E-posta Adresi
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="yeni@adres.com"
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <button
                  onClick={handleSendEmailOtp}
                  disabled={emailLoading || !newEmail}
                  className="w-full py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  {emailLoading ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
                </button>
              </div>
            )}

            {emailStep === "verify" && (
              <div className="space-y-4">
                <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-[13px]">
                  <strong>{newEmail}</strong> adresine 6 haneli doğrulama kodu
                  gönderildi.
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Doğrulama Kodu
                  </label>
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEmailStep("input")}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handleVerifyEmailOtp}
                    disabled={emailLoading || emailOtp.length < 6}
                    className="flex-1 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                  >
                    {emailLoading ? "Doğrulanıyor..." : "E-postayı Güncelle"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "password" && (
          <div className="max-w-md">
            <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
              Şifre Değiştir
            </h3>
            <p className="text-[13px] text-gray-500 mb-5">
              Güvenliğiniz için mevcut şifrenizi girerek yeni şifre
              oluşturabilirsiniz.
            </p>

            {pwSuccess && (
              <div className="flex items-center gap-2 bg-brand-50 text-brand-700 p-3 rounded-lg text-[13px] mb-4">
                <Check className="h-4 w-4 shrink-0" />
                {pwSuccess}
              </div>
            )}
            {pwError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-[13px] mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {pwError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Mevcut Şifre
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrent ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="En az 8 karakter"
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={pwLoading || !currentPassword || !newPassword}
                className="w-full py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {pwLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "support" && isAdmin && (
          <div className="max-w-md">
            <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
              Destek Ekibi Erişimi
            </h3>
            <p className="text-[13px] text-gray-500 mb-5">
              EthicAll destek ekibinin panelinize bağlanarak kurulum ve
              sorun giderme yapmasına izin verin.
            </p>

            {supportSuccess && (
              <div className="flex items-center gap-2 bg-brand-50 text-brand-700 p-3 rounded-lg text-[13px] mb-4">
                <Check className="h-4 w-4 shrink-0" />
                {supportSuccess}
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-gray-900">
                    Destek Ekibi Panelime Bağlanabilsin
                  </p>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {supportAccess
                      ? "Destek ekibi panelinize bağlanabilir"
                      : "Destek erişimi kapalı"}
                  </p>
                </div>
                <button
                  onClick={handleToggleSupportAccess}
                  disabled={supportLoading}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    supportAccess ? "bg-brand-600" : "bg-gray-300"
                  } ${supportLoading ? "opacity-50" : ""}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      supportAccess ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
