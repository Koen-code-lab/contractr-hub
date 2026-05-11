import { useEffect, useState, useRef } from "react";
import { Paperclip, FileText, FileSpreadsheet, FileType2, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { isImageAttachment, type Attachment } from "@/lib/attachments";

function docIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return FileType2;
  if (ext === "xlsx" || ext === "xls") return FileSpreadsheet;
  return FileText;
}

type Props = { attachments: Attachment[] };

export function AttachmentsViewer({ attachments }: Props) {
  const images = attachments.filter(isImageAttachment);
  const docs = attachments.filter((a) => !isImageAttachment(a));
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, images.length]);

  if (attachments.length === 0) return null;

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null || lightboxIdx === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) {
      setLightboxIdx((i) => i === null ? null : (i + (dx < 0 ? 1 : images.length - 1)) % images.length);
    }
    touchStart.current = null;
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-6 shadow-card mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Paperclip className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-display font-semibold text-lg">Bijlagen</h3>
        <span className="text-xs text-muted-foreground">({attachments.length})</span>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setLightboxIdx(i)}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
            >
              <img src={img.file_url} alt={img.file_name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </button>
          ))}
        </div>
      )}

      {docs.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {docs.map((d) => {
            const Icon = docIcon(d.file_name);
            return (
              <li key={d.id} className="flex items-center gap-3 p-3 bg-card">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{d.file_name}</div>
                  <div className="text-xs text-muted-foreground">{(d.file_name.split(".").pop() ?? "").toUpperCase()}</div>
                </div>
                <a
                  href={d.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={d.file_name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium hover:bg-secondary"
                >
                  <Download className="w-3.5 h-3.5" /> Open
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {lightboxIdx !== null && images[lightboxIdx] && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i === null ? null : (i - 1 + images.length) % images.length); }}
                className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
                aria-label="Vorige"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i === null ? null : (i + 1) % images.length); }}
                className="absolute right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
                aria-label="Volgende"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <img
            src={images[lightboxIdx].file_url}
            alt={images[lightboxIdx].file_name}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
