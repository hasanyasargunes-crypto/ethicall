"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Inbox,
  Search,
  Mail,
  MailOpen,
  MessageSquare,
  ArrowUpRight,
  Filter,
  User,
  Users,
} from "lucide-react";

type Message = {
  id: string;
  content: string;
  senderType: string;
  isRead: boolean;
  createdAt: string;
  sender: { name: string } | null;
  report: {
    id: string;
    trackingCode: string;
    title: string;
    status: string;
    category: { name_tr: string };
  };
};

const FILTERS = [
  { value: "all", label: "Tümü", icon: Inbox },
  { value: "unread", label: "Okunmamış", icon: Mail },
  { value: "reporter", label: "İhbarcı", icon: User },
  { value: "staff", label: "Ekip", icon: Users },
];

const STATUS_DOTS: Record<string, string> = {
  NEW: "bg-blue-500",
  ACKNOWLEDGED: "bg-amber-500",
  UNDER_REVIEW: "bg-purple-500",
  INVESTIGATING: "bg-orange-500",
  RESOLVED: "bg-emerald-500",
  CLOSED: "bg-gray-400",
  DISMISSED: "bg-red-400",
};

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  const fetchMessages = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/inbox?${params}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      setUnreadCount(data.unreadCount);
    }
    setLoading(false);
  }, [filter, search]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Az önce";
    if (mins < 60) return `${mins} dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} sa`;
    const days = Math.floor(hours / 24);
    return `${days} gün`;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">Gelen Kutusu</h1>
        <p className="page-subtitle">
          İhbarlara gelen mesajları buradan yönetin
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700">
              {unreadCount} okunmamış
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-5 h-[calc(100vh-180px)]">
        {/* Left Panel - Filter & List */}
        <div className="w-[380px] flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Mesajlarda ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-100 px-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors ${
                  filter === f.value
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
              </button>
            ))}
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20">
                <MailOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Mesaj bulunamadı</p>
              </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMsg(msg)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${
                    selectedMsg?.id === msg.id ? "bg-brand-50/50" : ""
                  } ${!msg.isRead && msg.senderType === "REPORTER" ? "bg-blue-50/30" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                        msg.senderType === "REPORTER"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-brand-100 text-brand-700"
                      }`}
                    >
                      {msg.senderType === "REPORTER"
                        ? "İH"
                        : (msg.sender?.name || "?")
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[13px] font-semibold text-gray-900 truncate">
                          {msg.senderType === "REPORTER"
                            ? "İhbarcı"
                            : msg.sender?.name || "Sistem"}
                        </span>
                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                          {timeAgo(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-500 truncate mb-1">
                        {msg.content.slice(0, 80)}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            STATUS_DOTS[msg.report.status] || "bg-gray-300"
                          }`}
                        />
                        <span className="text-[11px] text-gray-400 truncate">
                          {msg.report.trackingCode} · {msg.report.title}
                        </span>
                      </div>
                    </div>
                    {!msg.isRead && msg.senderType === "REPORTER" && (
                      <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Message Detail */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
          {selectedMsg ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          STATUS_DOTS[selectedMsg.report.status] || "bg-gray-300"
                        }`}
                      />
                      <span className="text-[13px] font-mono text-brand-600 font-medium">
                        {selectedMsg.report.trackingCode}
                      </span>
                      <span className="text-[12px] text-gray-400">
                        · {selectedMsg.report.category.name_tr}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-gray-900">
                      {selectedMsg.report.title}
                    </h3>
                  </div>
                  <Link
                    href={`/dashboard/reports/${selectedMsg.report.id}`}
                    className="flex items-center gap-1.5 text-[13px] text-brand-600 hover:text-brand-700 font-medium bg-brand-50 px-3 py-1.5 rounded-lg"
                  >
                    Dosyaya Git
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedMsg.senderType === "REPORTER"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-brand-100 text-brand-700"
                      }`}
                    >
                      {selectedMsg.senderType === "REPORTER"
                        ? "İH"
                        : (selectedMsg.sender?.name || "?")
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedMsg.senderType === "REPORTER"
                          ? "İhbarcı (Anonim)"
                          : selectedMsg.sender?.name || "Sistem"}
                      </p>
                      <p className="text-[12px] text-gray-400">
                        {new Date(selectedMsg.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMsg.content}
                  </div>
                </div>
              </div>

              {/* Reply Box */}
              <div className="border-t border-gray-100 px-6 py-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Yanıt yazın... (ihbar dosyasından da yanıtlayabilirsiniz)"
                    className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    disabled
                  />
                  <Link
                    href={`/dashboard/reports/${selectedMsg.report.id}`}
                    className="px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    Yanıtla
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">
                  Bir mesaj seçerek detaylarını görüntüleyin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
