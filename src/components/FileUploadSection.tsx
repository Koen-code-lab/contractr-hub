import { useRef, useState } from "react";
import { Upload, FileText, Image as ImageIcon, X } from "lucide-react";

type Visibility = "publiek" | "na-contact" | "prive";

type UploadedFile = {
  id: string;
  file: File;
  visibility: Visibility;
};

const visibilityOptions: { value: Visibility; label: string }[] = [
  { value: "publiek", label: "Publiek zichtbaar" },
  { value: "na-contact", label: "Enkel zichtbaar na contact" },
  { value: "prive", label: "Privé" },
];

function getFileKind(file: File) {
  const name = file.name.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp)$/.test(name)) return { label: "Foto", icon: ImageIcon };
  if (name.endsWith(".pdf")) return { label: "PDF", icon: FileText };
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return { label: "Excel", icon: FileText };
  if (name.endsWith(".docx") || name.endsWith(".doc")) return { label: "Word", icon: FileText };
  return { label: "Document", icon: FileText };
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadSection() {
  const photoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next: UploadedFile[] = Array.from(list).map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      visibility: "publiek",
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  const updateVisibility = (id: string, visibility: Visibility) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, visibility } : f)));
  };

  const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium block">Bijlagen <span className="text-muted-foreground font-normal">(optioneel)</span></label>
          <p className="text-xs text-muted-foreground mt-1">Voeg foto's of documenten toe. Ondersteund: jpg, png, pdf, xlsx, docx.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-foreground/30 transition-colors"
        >
          <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground" />
          <div className="mt-2 font-medium text-sm">Upload foto's</div>
          <div className="text-xs text-muted-foreground mt-1">JPG, PNG · meerdere bestanden</div>
          <input
            ref={photoRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
          />
        </button>

        <button
          type="button"
          onClick={() => docRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-foreground/30 transition-colors"
        >
          <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
          <div className="mt-2 font-medium text-sm">Upload documenten</div>
          <div className="text-xs text-muted-foreground mt-1">PDF, XLSX, DOCX · meerdere bestanden</div>
          <input
            ref={docRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.docx,.doc,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
          />
        </button>
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
          {files.map(({ id, file, visibility }) => {
            const { label, icon: Icon } = getFileKind(file);
            return (
              <li key={id} className="flex items-center gap-3 p-3 bg-card">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{label} · {formatSize(file.size)}</div>
                </div>
                <select
                  value={visibility}
                  onChange={(e) => updateVisibility(id, e.target.value as Visibility)}
                  className="h-9 px-3 rounded-lg bg-muted text-xs outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Zichtbaarheid"
                >
                  {visibilityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(id)}
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
    </div>
  );
}
