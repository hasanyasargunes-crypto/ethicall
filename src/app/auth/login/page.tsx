"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Giriş başarısız");
        setLoading(false);
        return;
      }

      setUserName(data.userName || "");
      if (data.demoCode) {
        setDemoCode(data.demoCode);
      }
      setStep("otp");
    } catch {
      setError("Bağlantı hatası");
    }
    setLoading(false);
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  }

  async function handleOtpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("6 haneli doğrulama kodunu girin");
      return;
    }

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      otp: code,
      redirect: false,
    });

    if (result?.error) {
      setError("Doğrulama kodu hatalı veya süresi dolmuş");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kod gönderilemedi");
      } else {
        setError("");
        setOtp(["", "", "", "", "", ""]);
        if (data.demoCode) setDemoCode(data.demoCode);
        otpRefs.current[0]?.focus();
      }
    } catch {
      setError("Bağlantı hatası");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              EthicAll
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {step === "credentials" ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-gray-900">Giriş Yap</h1>
                <p className="text-[13px] text-gray-500 mt-1">
                  Etik ekip paneline erişmek için giriş yapın
                </p>
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-[13px]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    E-posta
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sirket.com"
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Şifre
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors mt-2"
                >
                  {loading ? "Doğrulanıyor..." : "Devam Et"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-brand-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Doğrulama Kodu</h1>
                <p className="text-[13px] text-gray-500 mt-1">
                  <strong>{email}</strong> adresine gönderilen 6 haneli kodu girin
                </p>
                {demoCode && (
                  <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-[12px] text-amber-700 font-medium">Demo Modu - Doğrulama Kodu:</p>
                    <p className="text-lg font-bold text-amber-800 tracking-widest font-mono">{demoCode}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-[13px]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      autoFocus={i === 0}
                      className="w-11 h-12 text-center text-lg font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setOtp(["", "", "", "", "", ""]);
                      setError("");
                    }}
                    className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Geri
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[13px] text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
                  >
                    Tekrar Gönder
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[13px] text-gray-400 mt-5">
          EthicAll - Anonim Etik İhbar Platformu
        </p>
      </div>
    </div>
  );
}
