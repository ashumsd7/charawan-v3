"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  MessageCircle,
  PanelRightClose,
  Send,
  Share2,
  Sparkles,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";

export type ChatAssistantLabels = {
  title: string;
  subtitle: string;
  welcome: string;
  hintsTitle: string;
  hint1: string;
  hint2: string;
  hint3: string;
  hint4: string;
  placeholder: string;
  send: string;
  thinking: string;
  close: string;
  fabAria: string;
  copy: string;
  share: string;
  copied: string;
  sourceIntro: string;
  sourceOutro: string;
  shareFallback: string;
};

type Msg = { role: "user" | "bot"; text: string };

const HINT_KEYS = ["hint1", "hint2", "hint3", "hint4"] as const;

const HINT_GRADIENTS = [
  "bg-gradient-to-r from-teal-500/35 via-cyan-400/20 to-amber-400/25 text-teal-950 shadow-teal-500/20 ring-teal-500/30 dark:from-teal-400/25 dark:via-cyan-500/15 dark:to-amber-500/20 dark:text-teal-50 dark:ring-teal-400/25",
  "bg-gradient-to-r from-emerald-500/30 via-teal-400/20 to-sky-400/20 text-emerald-950 shadow-emerald-500/15 ring-emerald-500/25 dark:from-emerald-400/22 dark:text-emerald-50 dark:ring-emerald-400/20",
  "bg-gradient-to-r from-cyan-500/28 via-sky-400/18 to-indigo-400/22 text-slate-900 shadow-cyan-500/15 ring-cyan-500/25 dark:from-cyan-400/22 dark:text-slate-50 dark:ring-cyan-400/20",
  "bg-gradient-to-r from-amber-500/30 via-orange-400/20 to-rose-400/18 text-amber-950 shadow-amber-500/15 ring-amber-500/30 dark:from-amber-400/22 dark:text-amber-50 dark:ring-amber-400/25",
] as const;

const PURIFY_OPTS = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "a",
    "span",
    "div",
    "h3",
    "h4",
    "h5",
    "blockquote",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
};

function looksLikeHtml(s: string): boolean {
  return /<\/[a-z][\w]*>|<[a-z][\w]*(\s|>)/i.test(s);
}

/** `**डॉ. शर्मा**` → `<strong>डॉ. शर्मा</strong>` (model अक्सर markdown भेजता है). */
function expandMarkdownDoubleAsterisk(s: string): string {
  return s.replace(/\*\*([\s\S]*?)\*\*/g, (_, inner: string) => {
    const t = String(inner).trim();
    return t ? `<strong>${t}</strong>` : "";
  });
}

function hasBlockLevelHtml(s: string): boolean {
  return /<\s*(p|div|ul|ol|table|h[1-6]|blockquote|li)\b/i.test(s);
}

function sanitizeHtml(raw: string): string {
  return DOMPurify.sanitize(raw, PURIFY_OPTS);
}

/** Inline / fragment HTML: newlines → <br /> ताकि bold के साथ लाइनें टूटें. */
function fragmentNewlinesToBr(s: string): string {
  if (hasBlockLevelHtml(s)) return s;
  return s.replace(/\r\n|\r|\n/g, "<br />");
}

function prepareBotRichHtml(raw: string): string | null {
  const withBold = expandMarkdownDoubleAsterisk(raw);
  if (!looksLikeHtml(withBold)) return null;
  const withBreaks = fragmentNewlinesToBr(withBold);
  return sanitizeHtml(withBreaks);
}

function toPlainText(raw: string): string {
  const withBold = expandMarkdownDoubleAsterisk(raw);
  if (!looksLikeHtml(withBold)) return withBold.replace(/<[^>]+>/g, "").trim() || raw;
  const clean = DOMPurify.sanitize(withBold, {
    ALLOWED_TAGS: ["br", "strong", "b", "em", "i", "p", "a"],
    ALLOWED_ATTR: ["href"],
  });
  return clean
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ChatThinkingDots({ label }: { label: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl rounded-bl-md border border-slate-200/90 bg-white px-4 py-3 shadow-sm dark:border-slate-600 dark:bg-slate-900/80"
    >
      <div className="flex items-center gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-accent"
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 1, 0.35] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-[13px] text-muted">{label}</span>
    </motion.div>
  );
}

function BotMessageBlock({
  htmlOrText,
  showSource,
  labels,
}: {
  htmlOrText: string;
  showSource: boolean;
  labels: ChatAssistantLabels;
}) {
  const [copied, setCopied] = useState(false);
  const safeHtml = prepareBotRichHtml(htmlOrText);
  const isRich = safeHtml !== null && safeHtml.length > 0;
  const plain = toPlainText(htmlOrText);

  const sourceUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?chatbot=true`
      : "";

  const host =
    typeof window !== "undefined" ? window.location.host : "";

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const onShare = async () => {
    const url = sourceUrl;
    try {
      if (navigator.share) {
        await navigator.share({
          title: labels.title,
          text: plain.slice(0, 1600),
          url,
        });
      } else {
        await navigator.clipboard.writeText(`${plain}\n\n${url}`);
        alert(labels.shareFallback);
      }
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <div className="min-w-0 flex-1 space-y-2">
      <motion.div
        layout
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="rounded-2xl rounded-bl-md border border-slate-200/90 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground shadow-sm dark:border-slate-600 dark:bg-slate-900/80"
      >
        {isRich ? (
          <div
            className="chat-bot-html break-words [&_a]:text-accent [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-accent/40 [&_blockquote]:pl-3 [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h4]:mb-1 [&_h4]:font-semibold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <p className="whitespace-pre-wrap break-words">{htmlOrText}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-slate-200/70 pt-2 dark:border-slate-600/80">
          <button
            type="button"
            onClick={() => void onCopy()}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-muted transition hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            {copied ? labels.copied : labels.copy}
          </button>
          <button
            type="button"
            onClick={() => void onShare()}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-muted transition hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden />
            {labels.share}
          </button>
        </div>

        {showSource && sourceUrl ? (
          <p className="mt-2 border-t border-slate-200/60 pt-2 text-[11px] leading-snug text-muted dark:border-slate-600/60">
            {labels.sourceIntro}
            <a
              href={sourceUrl}
              className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
            >
              {host}
            </a>
            {labels.sourceOutro}
          </p>
        ) : null}
      </motion.div>
    </div>
  );
}

export function ChatAssistant({ labels }: { labels: ChatAssistantLabels }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "bot", text: labels.welcome }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const hints = HINT_KEYS.map((k) => labels[k]);
  const showQuickHints = !messages.some((m) => m.role === "user");

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("chatbot") === "true") {
        setOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const updateOpen = useCallback((next: boolean) => {
    setOpen(next);
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      if (next) url.searchParams.set("chatbot", "true");
      else url.searchParams.delete("chatbot");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onOpenChat = () => updateOpen(true);
    window.addEventListener("charawan:open-chat", onOpenChat);
    return () => window.removeEventListener("charawan:open-chat", onOpenChat);
  }, [updateOpen]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const q = (overrideText !== undefined ? overrideText : input).trim();
      if (!q || loading) return;

      const priorMessages = messages.slice(1).map((m) => ({
        isBot: m.role === "bot",
        text: m.text,
      }));

      setMessages((prev) => [...prev, { role: "user", text: q }]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            messages: priorMessages,
            inputMessage: q,
          }),
        });
        const data = (await res.json()) as { answer?: string; error?: string };
        const reply =
          typeof data.answer === "string" && data.answer.trim()
            ? data.answer.trim()
            : typeof data.error === "string"
              ? data.error
              : res.ok
                ? "कोई जवाब नहीं मिला।"
                : "सर्वर त्रुटि। बाद में कोशिश करें।";
        setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "नेटवर्क त्रुटि। इंटरनेट जाँचकर फिर कोशिश करें।",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages],
  );

  return (
    <>
      <AnimatePresence>
        {!open ? (
          <motion.button
            key="fab"
            type="button"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            aria-label={labels.fabAria}
            aria-expanded={false}
            onClick={() => updateOpen(true)}
            className="fixed bottom-6 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-[0_8px_30px_rgba(13,148,136,0.35)] ring-2 ring-white/50 transition-[box-shadow] hover:shadow-[0_12px_36px_rgba(13,148,136,0.45)] dark:ring-slate-900/50"
          >
            <MessageCircle className="h-7 w-7" strokeWidth={2} aria-hidden />
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="backdrop"
              role="presentation"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] dark:bg-black/55"
              onClick={() => updateOpen(false)}
            />
            <motion.aside
              key="sidebar"
              role="dialog"
              aria-modal="true"
              aria-labelledby="chat-assistant-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-[51] flex h-dvh w-[90vw] min-w-[280px] flex-col border-l border-slate-200/90 bg-card shadow-[-12px_0_48px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:shadow-[-12px_0_48px_rgba(0,0,0,0.4)] lg:w-1/2 lg:max-w-[min(50vw,720px)]"
            >
              <header className="relative shrink-0 overflow-hidden border-b border-slate-200/80 bg-gradient-to-br from-accent/20 via-card to-card px-4 py-4 dark:border-slate-700 dark:from-accent/15">
                <motion.div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl"
                  aria-hidden
                  animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/25 text-accent shadow-inner ring-1 ring-accent/20">
                      <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h2 id="chat-assistant-title" className="text-lg font-semibold tracking-tight text-foreground">
                        {labels.title}
                      </h2>
                      <p className="text-xs font-medium text-muted">{labels.subtitle}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
                    onClick={() => updateOpen(false)}
                    aria-label={labels.close}
                  >
                    <PanelRightClose className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </header>

              <AnimatePresence initial={false}>
                {showQuickHints ? (
                  <motion.div
                    key="quick-hints"
                    initial={false}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="shrink-0 overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50/95 to-slate-50/60 dark:border-slate-800 dark:from-slate-900/50 dark:to-slate-900/30"
                  >
                    <div className="px-4 py-3">
                      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                        {labels.hintsTitle}
                      </p>
                      <div className="flex flex-col gap-2">
                        {hints.map((h, i) => (
                          <motion.button
                            key={h}
                            type="button"
                            disabled={loading}
                            onClick={() => void sendMessage(h)}
                            whileHover={{ scale: loading ? 1 : 1.01 }}
                            whileTap={{ scale: loading ? 1 : 0.99 }}
                            className={`rounded-xl px-3 py-2.5 text-left text-[13px] font-medium leading-snug shadow-md ring-1 transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-lg/20 ${HINT_GRADIENTS[i % HINT_GRADIENTS.length]}`}
                          >
                            {h}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div
                ref={listRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,var(--background)_0%,transparent_24px)] px-4 py-4"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <div
                      key={`${i}-${msg.text.slice(0, 32)}`}
                      className={`flex w-full gap-2 ${msg.role === "user" ? "items-end justify-end" : "items-end justify-start"}`}
                    >
                      {msg.role === "user" ? (
                        <>
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", damping: 24, stiffness: 380 }}
                            className="max-w-[min(90%,20rem)] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-[13px] leading-relaxed text-accent-foreground shadow-md"
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </motion.div>
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 shadow-sm ring-1 ring-slate-300/80 dark:bg-slate-700 dark:text-slate-100 dark:ring-slate-600"
                            aria-hidden
                          >
                            <User className="h-[18px] w-[18px]" strokeWidth={2} />
                          </span>
                        </>
                      ) : (
                        <>
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent shadow-sm ring-1 ring-accent/30 dark:bg-accent/25"
                            aria-hidden
                          >
                            <Bot className="h-[18px] w-[18px]" strokeWidth={2} />
                          </span>
                          <BotMessageBlock
                            htmlOrText={msg.text}
                            showSource={i > 0}
                            labels={labels}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </AnimatePresence>
                {loading ? (
                  <div className="flex w-full items-end justify-start gap-2">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent shadow-sm ring-1 ring-accent/30 dark:bg-accent/25"
                      aria-hidden
                    >
                      <Bot className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <ChatThinkingDots label={labels.thinking} />
                  </div>
                ) : null}
              </div>

              <footer className="shrink-0 border-t border-slate-200/90 bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm dark:border-slate-700">
                <div className="flex gap-2 rounded-2xl border border-slate-200/90 bg-background p-1.5 shadow-inner dark:border-slate-600">
                  <input
                    className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 py-2.5 text-[13px] text-foreground outline-none placeholder:text-muted"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={labels.placeholder}
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void sendMessage(undefined);
                      }
                    }}
                    aria-label={labels.placeholder}
                  />
                  <motion.button
                    type="button"
                    onClick={() => void sendMessage(undefined)}
                    disabled={loading || !input.trim()}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-foreground shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Send className="h-4 w-4" aria-hidden />
                    <span>{labels.send}</span>
                  </motion.button>
                </div>
              </footer>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
