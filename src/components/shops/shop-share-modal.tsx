"use client";

import { useEffect } from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
import { Share2, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description: string;
};

export function ShopShareModal({ open, onClose, url, title, description }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const size = 44;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-card p-6 shadow-2xl dark:border-slate-600">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-muted transition hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          aria-label="बंद करें"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="share-dialog-title" className="flex items-center gap-2 pr-10 text-lg font-bold text-foreground">
          <Share2 className="h-5 w-5 text-accent" aria-hidden />
          शेयर करें
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">{title}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <WhatsappShareButton url={url} title={title} separator="\n">
            <WhatsappIcon size={size} round />
          </WhatsappShareButton>
          <FacebookShareButton url={url} hashtag="#चरावां">
            <FacebookIcon size={size} round />
          </FacebookShareButton>
          <TwitterShareButton url={url} title={title}>
            <TwitterIcon size={size} round />
          </TwitterShareButton>
          <EmailShareButton url={url} subject={title} body={description} separator="\n\n">
            <EmailIcon size={size} round />
          </EmailShareButton>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
            } catch {
              /* ignore */
            }
            onClose();
          }}
          className="mt-6 w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-bold text-foreground transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          लिंक कॉपी करें
        </button>
      </div>
    </div>
  );
}
