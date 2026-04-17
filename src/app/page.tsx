'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { BookOpen, MessageSquare, Heart, Star, Sparkles, Quote, X, Feather } from 'lucide-react';
import { storyService } from "../services/storyService";
import { useAuth } from "../contexts/AuthContext";
import { useGuest } from "../contexts/GuestContext";

/* ── Catppuccin Mocha tokens (inline for component-level use) ── */
const C = {
  base:     '#1e1e2e',
  mantle:   '#181825',
  crust:    '#11111b',
  surface0: '#313244',
  surface1: '#45475a',
  surface2: '#585b70',
  overlay0: '#6c7086',
  overlay1: '#7f849c',
  subtext0: '#a6adc8',
  subtext1: '#bac2de',
  text:     '#cdd6f4',
  mauve:    '#cba6f7',
  blue:     '#89b4fa',
  lavender: '#b4befe',
  peach:    '#fab387',
  green:    '#a6e3a1',
  teal:     '#94e2d5',
  yellow:   '#f9e2af',
  red:      '#f38ba8',
  sky:      '#89dceb',
  sapphire: '#74c7ec',
} as const;

/* Accent cycle for sticky note cards */
const ACCENTS = [C.mauve, C.blue, C.peach, C.teal, C.lavender, C.sky, C.yellow, C.green];

interface Message {
  _id: string;
  name: string;
  content: string;
  reply?: string;
  createdAt: string;
  guestReplies?: Array<{
    _id: string;
    guestId: string;
    guestName: string;
    guestEmail: string;
    guestPicture?: string;
    content: string;
    createdAt: string;
  }>;
}

export default function Home() {
  const { user, isAuthenticated: isAdminAuthenticated } = useAuth();
  const { guest, isAuthenticated: isGuestAuthenticated } = useGuest();

  const isAuthenticated = isAdminAuthenticated || isGuestAuthenticated;
  const currentUser = user || guest;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastRotationTime, setLastRotationTime] = useState<number>(0);
  const [currentHourlyMessages, setCurrentHourlyMessages] = useState<Message[]>([]);
  const [cardRotations, setCardRotations] = useState<number[]>([]);



  useEffect(() => {
    setIsMounted(true);
    try {
      const storedTime = localStorage.getItem('lastRotationTime');
      const storedMsgs = localStorage.getItem('currentHourlyMessages');
      if (storedTime && storedMsgs) {
        setLastRotationTime(parseInt(storedTime));
        setCurrentHourlyMessages(JSON.parse(storedMsgs));
      }
    } catch (e) { console.error('Error restoring hourly state:', e); }
    loadMessages();
  }, []);

  useEffect(() => {
    if (!isMounted || messages.length === 0) return;
    const now = Date.now();
    const oneHour = 3600_000;
    if (now - lastRotationTime >= oneHour || currentHourlyMessages.length === 0) {
      const shuffled = [...messages].sort(() => Math.random() - 0.5);
      const max = window.innerWidth < 768 ? 6 : 20;
      const next = shuffled.slice(0, max);
      setCurrentHourlyMessages(next);
      setDisplayedMessages(next);
      setCardRotations(next.map(() => Math.random() * 5 - 2.5));
      setLastRotationTime(now);
      localStorage.setItem('lastRotationTime', String(now));
      localStorage.setItem('currentHourlyMessages', JSON.stringify(next));
    } else {
      setDisplayedMessages(currentHourlyMessages);
      setCardRotations(currentHourlyMessages.map(() => Math.random() * 5 - 2.5));
    }
  }, [isMounted, messages]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      if (now - lastRotationTime >= 3600_000 && messages.length > 0) setLastRotationTime(now);
    }, 60_000);
    return () => clearInterval(id);
  }, [lastRotationTime, messages.length]);

  useEffect(() => {
    if (selectedMessage && messages.length > 0) {
      const updated = messages.find(m => m._id === selectedMessage._id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedMessage)) setSelectedMessage(updated);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const res = await storyService.getMessages();
      setMessages(res.messages || []);
    } catch (e) { console.error('Failed to load messages:', e); }
    finally { setIsLoading(false); }
  };

  const noteIcons = [Heart, Star, Sparkles, Quote, MessageSquare, Feather];

  const handleMessageClick = (msg: Message) => { setSelectedMessage(msg); setShowPopup(true); };
  const closePopup = () => { setShowPopup(false); setSelectedMessage(null); setReplyText(''); };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    if (!isAuthenticated || !currentUser) {
      setNotification({ type: 'error', message: 'Vui lòng đăng nhập để trả lời tin nhắn!' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }
    try {
      setIsSendingReply(true);
      const payload = {
        messageId: selectedMessage._id,
        content: replyText,
        guestId: currentUser.id,
        guestName: 'username' in currentUser ? currentUser.username : currentUser.displayName,
        guestEmail: 'email' in currentUser ? currentUser.email : 'guest@example.com',
        guestPicture: 'picture' in currentUser ? currentUser.picture : undefined,
      };
      await storyService.addGuestReply(payload);
      await loadMessages();
      setReplyText('');
      setNotification({ type: 'success', message: 'Đã thêm câu trả lời thành công!' });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ type: 'error', message: 'Có lỗi xảy ra khi thêm câu trả lời!' });
      setTimeout(() => setNotification(null), 5000);
    } finally { setIsSendingReply(false); }
  };

  /* ── Sticky Note Card ── */
  const renderMessage = (msg: Message, idx: number, rotation: number) => {
    const Icon = noteIcons[idx % noteIcons.length];
    const accent = ACCENTS[idx % ACCENTS.length];
    const preview = msg.content.length > 180 ? msg.content.slice(0, 180) + '…' : msg.content;

    return (
      <div
        key={msg._id}
        className="group cursor-pointer relative"
        style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease, z-index 0s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = `rotate(${rotation * 0.3}deg) translateY(-6px)`; (e.currentTarget as HTMLElement).style.zIndex = '10'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = `rotate(${rotation}deg)`; (e.currentTarget as HTMLElement).style.zIndex = '0'; }}
        onClick={() => handleMessageClick(msg)}
      >
        <div
          className="relative flex flex-col h-[170px] sm:h-[160px] rounded-2xl overflow-hidden"
          style={{
            backgroundColor: C.surface0,
            border: `1px solid ${C.surface1}`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
          }}
        >
          {/* Color top strip */}
          <div className="h-[3px] flex-shrink-0 w-full" style={{ backgroundColor: accent }} />

          {/* Pin */}
          <div
            className="absolute top-3.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}60` }}
          />

          {/* Body */}
          <div className="flex flex-col flex-1 px-3 pt-5 pb-2.5 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={10} style={{ color: accent }} className="flex-shrink-0" />
              <span className="text-[10px] font-semibold truncate" style={{ color: accent, maxWidth: 84 }}>
                {msg.name}
              </span>
            </div>
            <p className="flex-1 text-[11px] sm:text-xs leading-relaxed line-clamp-4" style={{ color: C.subtext1 }}>
              {preview}
            </p>
            <p className="text-right text-[9px] mt-1.5" style={{ color: C.overlay0 }}>
              {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Hover overlay */}
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ backgroundColor: `${accent}10` }}
          >
            <span
              className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg"
              style={{ backgroundColor: C.mantle, color: accent, border: `1px solid ${accent}50` }}
            >
              <MessageSquare size={10} />
              Xem chi tiết
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.base }}>
      {/* ─── Hero ─── */}
      <section className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-12 text-center">
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: C.mauve, opacity: 0.06 }}
        />

        {/* Badge */}
        <div
          className="relative inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-medium"
          style={{ color: C.mauve, backgroundColor: `${C.mauve}12`, border: `1px solid ${C.mauve}30` }}
        >
          <Feather size={11} />
          Nhật ký văn học
        </div>

        <h1
          className="relative text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight"
          style={{ color: C.text }}
        >
          Chào mừng đến với
          <br />
          <span style={{ color: C.mauve }}>Meo Meo Ký</span>
        </h1>

        <p className="relative text-sm sm:text-base max-w-sm mx-auto mb-10 leading-relaxed" style={{ color: C.overlay1 }}>
          Nơi lưu trữ những câu chuyện, suy nghĩ và sáng tác văn học của tôi
        </p>

        <Link
          href="/stories"
          className="relative inline-flex items-center gap-2.5 text-sm font-semibold px-7 py-3 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
          style={{
            backgroundColor: C.mauve,
            color: C.crust,
            boxShadow: `0 0 0 1px ${C.mauve}50, 0 6px 24px ${C.mauve}30`,
          }}
        >
          <BookOpen size={16} />
          Đọc Truyện của Tôi
        </Link>
      </section>

      {/* ─── Messages Section ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-0.5 h-5 rounded-full" style={{ backgroundColor: C.mauve }} />
            <h2 className="text-base font-bold" style={{ color: C.text }}>Tin Nhắn từ Độc Giả</h2>
            <span className="hidden sm:block text-xs" style={{ color: C.overlay0 }}>
              — Những lời động viên từ các bạn
            </span>
          </div>
          {messages.length > 0 && (
            <span
              className="text-[11px] px-2.5 py-1 rounded-full"
              style={{ color: C.overlay1, backgroundColor: C.surface0, border: `1px solid ${C.surface1}` }}
            >
              {messages.length} tin
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14">
              <Image src="/reading.gif" alt="Loading..." width={56} height={56} className="rounded-xl object-cover w-full h-full" unoptimized />
            </div>
            <p className="text-xs" style={{ color: C.overlay0 }}>Đang tải tin nhắn...</p>
          </div>

        ) : displayedMessages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${C.mauve}12`, border: `1px solid ${C.mauve}25` }}
            >
              <MessageSquare size={26} style={{ color: C.mauve }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-1" style={{ color: C.subtext0 }}>Chưa có tin nhắn nào</p>
              <p className="text-xs" style={{ color: C.overlay1 }}>Hãy là người đầu tiên để lại tin nhắn!</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: C.mauve, color: C.crust, boxShadow: `0 4px 16px ${C.mauve}30` }}
            >
              <MessageSquare size={14} />
              Gửi Tin Nhắn
            </Link>
          </div>

        ) : (
          <>
            {/* Grid — clean responsive CSS, no window.innerWidth */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {displayedMessages.map((msg, idx) => renderMessage(msg, idx, cardRotations[idx] ?? 0))}
            </div>

            {messages.length > displayedMessages.length && (
              <div className="mt-8 text-center">
                <div
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl text-xs"
                  style={{ color: C.overlay1, backgroundColor: C.surface0, border: `1px solid ${C.surface1}` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.mauve }} />
                  Còn {messages.length - displayedMessages.length} tin nhắn khác ·
                  <Link href="/contact" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: C.mauve }}>
                    Gửi tin nhắn →
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ─── CTA Section ─── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div
          className="relative overflow-hidden rounded-2xl p-8 sm:p-10 text-center"
          style={{ backgroundColor: C.mantle, border: `1px solid ${C.surface0}` }}
        >
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-56 h-28 blur-3xl rounded-full pointer-events-none" style={{ backgroundColor: C.mauve, opacity: 0.1 }} />

          <div className="relative">
            <div
              className="w-11 h-11 rounded-xl mx-auto mb-5 flex items-center justify-center"
              style={{ backgroundColor: `${C.mauve}15`, border: `1px solid ${C.mauve}25` }}
            >
              <MessageSquare size={20} style={{ color: C.mauve }} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 tracking-tight" style={{ color: C.text }}>
              Bạn muốn để lại tin nhắn?
            </h3>
            <p className="text-sm max-w-xs mx-auto mb-7 leading-relaxed" style={{ color: C.overlay1 }}>
              Chia sẻ cảm nhận, góp ý hoặc đơn giản là lời động viên cho tôi
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
              style={{ backgroundColor: C.mauve, color: C.crust, boxShadow: `0 4px 20px ${C.mauve}30` }}
            >
              <MessageSquare size={14} />
              Gửi Tin Nhắn Ngay
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Message Detail Modal ─── */}
      {showPopup && selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={closePopup}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(17,17,27,0.75)' }} />

          {/* Panel */}
          <div
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl"
            style={{ backgroundColor: C.mantle, border: `1px solid ${C.surface0}` }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-9 h-1 rounded-full" style={{ backgroundColor: C.surface1 }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.surface0 }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${C.mauve}15` }}>
                  <MessageSquare size={15} style={{ color: C.mauve }} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: C.overlay0 }}>Tin nhắn từ</p>
                  <p className="text-sm font-bold" style={{ color: C.text }}>{selectedMessage.name}</p>
                </div>
              </div>
              <button
                onClick={closePopup}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                style={{ color: C.overlay0 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.text}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.overlay0}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Message */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: C.surface0, border: `1px solid ${C.surface1}` }}>
                <p className="text-sm leading-relaxed" style={{ color: C.subtext1 }}>{selectedMessage.content}</p>
              </div>

              {/* Admin reply */}
              {selectedMessage.reply && (
                <div className="p-4 rounded-xl border" style={{ backgroundColor: `${C.peach}08`, borderColor: `${C.peach}25` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-0.5 h-3 rounded-full" style={{ backgroundColor: C.peach }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.peach }}>Trả lời của Admin</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: C.peach }}>{selectedMessage.reply}</p>
                </div>
              )}

              {/* Guest replies */}
              {selectedMessage.guestReplies && selectedMessage.guestReplies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-0.5 h-3 rounded-full" style={{ backgroundColor: C.mauve }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.overlay1 }}>
                      Phản hồi ({selectedMessage.guestReplies.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedMessage.guestReplies.map((reply, idx) => (
                      <div key={reply._id || idx} className="p-3 rounded-xl" style={{ backgroundColor: C.surface0, border: `1px solid ${C.surface1}` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: C.mauve, color: C.crust }}>
                            {reply.guestName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold" style={{ color: C.subtext0 }}>{reply.guestName}</span>
                          <span className="text-[10px] ml-auto" style={{ color: C.overlay0 }}>
                            {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed pl-8" style={{ color: C.subtext0 }}>{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply input */}
              {!isAuthenticated ? (
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: C.surface0 }}>
                  <p className="text-xs mb-3" style={{ color: C.overlay1 }}>Đăng nhập để trả lời tin nhắn này</p>
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-5 py-2 rounded-lg transition-all hover:opacity-90"
                    style={{ backgroundColor: C.mauve, color: C.crust }}
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-3 rounded-full" style={{ backgroundColor: C.blue }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.overlay1 }}>Thêm câu trả lời</span>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung trả lời..."
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none transition-all duration-200"
                    style={{
                      backgroundColor: C.surface0,
                      border: `1px solid ${C.surface1}`,
                      color: C.text,
                    }}
                    rows={3}
                    onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = C.mauve}
                    onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = C.surface1}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || isSendingReply}
                      className="px-5 py-2 text-xs font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: C.mauve, color: C.crust }}
                    >
                      {isSendingReply ? 'Đang gửi...' : 'Gửi trả lời'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: C.surface0 }}>
              <span className="text-[10px]" style={{ color: C.overlay0 }}>
                {new Date(selectedMessage.createdAt).toLocaleDateString('vi-VN')} · {selectedMessage.content.length} ký tự
              </span>
              <button
                onClick={closePopup}
                className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ color: C.subtext0, backgroundColor: C.surface0, border: `1px solid ${C.surface1}` }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Notification ─── */}
      {notification && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-max max-w-[calc(100vw-2rem)]">
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium"
            style={notification.type === 'success'
              ? { backgroundColor: C.surface0, border: `1px solid ${C.green}40`, color: C.green }
              : { backgroundColor: C.surface0, border: `1px solid ${C.red}40`, color: C.red }
            }
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: notification.type === 'success' ? `${C.green}20` : `${C.red}20` }}
            >
              {notification.type === 'success'
                ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                : <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              }
            </div>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-1 opacity-50 hover:opacity-80 transition-opacity flex-shrink-0">
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
