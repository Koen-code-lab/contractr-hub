import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  type Attachment,
  fetchAttachmentsForProject,
  fetchAttachmentsForCapacity,
  uploadAttachments,
  deleteAttachment,
  isImageAttachment,
  validateAttachment,
} from "@/lib/attachments";

type Props =
  | { projectId: string; capacityPostId?: undefined; userId: string }
  | { capacityPostId: string; projectId?: undefined; userId: string };

export function AttachmentsEditor(props: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const key = props.projectId
    ? ["attachments", "project", props.projectId]
    : ["attachments", "capacity", props.capacityPostId];

  const { data: attachments = [] } = useQuery({
    queryKey: key,
    queryFn: () =>
      props.projectId
        ? fetchAttachmentsForProject(props.projectId)
        : fetchAttachmentsForCapacity(props.capacityPostId!),
  });

  const onAdd = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const files = Array.from(list);
    for (const f of files) {
      const err = validateAttachment(f);
      if (err) { toast.error(err); return; }
    }
    setBusy(true);
    const target = props.projectId
      ? { projectId: props.projectId }
      : { capacityPostId: props.capacityPostId! };
    const { failed } = await uploadAttachments(files, props.userId, target);
    setBusy(false);
    if (failed.length) toast.error(`Niet geüpload: ${failed.join(", ")}`);
    else toast.success("Bijlage(n) toegevoegd.");
    qc.invalidateQueries({ queryKey: key });
  };

  const onDelete = async (a: Attachment) => {
    if (!confirm(`Verwijder "${a.file_name}"?`)) return;
    try {
      await deleteAttachment(a);
      toast.success("Verwijderd.");
      qc.invalidateQueries({ queryKey: key });
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Bijlagen</h3>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Toevoegen
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx,image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => { onAdd(e.target.files); e.target.value = ""; }}
        />
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nog geen bijlagen. Max 10MB per bestand (jpg, png, webp, pdf, docx, xlsx).</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {attachments.map((a) => {
            const isImg = isImageAttachment(a);
            return (
              <li key={a.id} className="flex items-center gap-3 p-3 bg-card">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {isImg ? (
                    <img src={a.file_url} alt={a.file_name} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline truncate block">{a.file_name}</a>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {isImg ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {(a.file_name.split(".").pop() ?? "").toUpperCase()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(a)}
                  className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                  aria-label="Verwijderen"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
