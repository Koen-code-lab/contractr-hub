import { supabase } from "@/lib/supabase";

export type Attachment = {
  id: string;
  project_id: string | null;
  capacity_post_id: string | null;
  uploaded_by: string | null;
  file_name: string;
  file_type: string | null;
  file_url: string;
  storage_path: string;
  created_at: string;
  source?: "post_attachments" | "project_files";
};

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "pdf", "docx", "xlsx"];

export function validateAttachment(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.includes(ext)) return `Bestandstype niet toegestaan: ${file.name}`;
  if (file.size > MAX_ATTACHMENT_BYTES) return `Bestand te groot (>10MB): ${file.name}`;
  return null;
}

export function isImageAttachment(a: Pick<Attachment, "file_type" | "file_name">) {
  const t = (a.file_type ?? "").toLowerCase();
  if (t.startsWith("image/")) return true;
  const ext = a.file_name.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
}

function storagePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/project-files/";
  const idx = url.indexOf(marker);
  if (idx >= 0) return decodeURIComponent(url.slice(idx + marker.length));
  return url;
}

function mergeProjectAttachments(postRows: Attachment[], legacyRows: Array<{
  id: string;
  project_id: string;
  file_name: string;
  file_type: string | null;
  file_url: string;
  uploaded_at: string;
}>) {
  const seen = new Set<string>();
  const merged: Attachment[] = [];
  for (const row of postRows) {
    const key = row.storage_path || row.file_url;
    seen.add(key);
    merged.push({ ...row, source: "post_attachments" });
  }
  for (const row of legacyRows) {
    const storagePath = storagePathFromPublicUrl(row.file_url);
    const key = storagePath || row.file_url;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({
      id: row.id,
      project_id: row.project_id,
      capacity_post_id: null,
      uploaded_by: null,
      file_name: row.file_name,
      file_type: row.file_type,
      file_url: row.file_url,
      storage_path: storagePath,
      created_at: row.uploaded_at,
      source: "project_files",
    });
  }
  return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

type UploadTarget =
  | { projectId: string; capacityPostId?: undefined }
  | { capacityPostId: string; projectId?: undefined };

export async function uploadAttachments(
  files: File[],
  userId: string,
  target: UploadTarget,
): Promise<{ failed: string[] }> {
  const failed: string[] = [];
  for (const file of files) {
    const err = validateAttachment(file);
    if (err) { failed.push(file.name); continue; }
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const parentId = target.projectId ?? target.capacityPostId!;
    const folder = target.projectId ? "projects" : "capacity";
    const path = `${userId}/${folder}/${parentId}/${Date.now()}-${safe}`;
    console.log("[attachments] upload start", {
      fileName: file.name,
      resolvedProjectId: target.projectId ?? null,
      resolvedCapacityPostId: target.capacityPostId ?? null,
      storagePath: path,
    });
    const up = await supabase.storage.from("project-files").upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (up.error) { console.error("[attachments] storage upload failed", up.error); failed.push(file.name); continue; }
    const { data: pub } = supabase.storage.from("project-files").getPublicUrl(up.data.path);
    console.log("[attachments] uploaded file URL", {
      fileName: file.name,
      fileUrl: pub.publicUrl,
      storagePath: up.data.path,
      resolvedProjectId: target.projectId ?? null,
      resolvedCapacityPostId: target.capacityPostId ?? null,
    });
    const row = {
      project_id: target.projectId ?? null,
      capacity_post_id: target.capacityPostId ?? null,
      uploaded_by: userId,
      file_name: file.name,
      file_type: file.type || null,
      file_url: pub.publicUrl,
      storage_path: up.data.path,
    };
    console.log("[attachments] inserting attachment row", row);
    const { data: inserted, error: insErr } = await supabase
      .from("post_attachments")
      .insert(row)
      .select("*")
      .single();
    if (insErr) {
      console.error("[attachments] metadata insert failed", insErr);
      await supabase.storage.from("project-files").remove([up.data.path]);
      failed.push(file.name);
    } else {
      console.log("[attachments] inserted attachment row", inserted);
    }
  }
  return { failed };
}

export async function deleteAttachment(att: Pick<Attachment, "id" | "storage_path">) {
  await supabase.storage.from("project-files").remove([att.storage_path]);
  const { error } = await supabase.from("post_attachments" as never).delete().eq("id", att.id);
  if (error) throw error;
}

export async function fetchAttachmentsForProject(projectId: string): Promise<Attachment[]> {
  const { data, error } = await supabase
    .from("post_attachments" as never)
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const { data: legacy, error: legacyError } = await supabase
    .from("project_files")
    .select("id, project_id, file_name, file_type, file_url, uploaded_at")
    .eq("project_id", projectId)
    .order("uploaded_at", { ascending: true });
  if (legacyError) throw legacyError;
  const merged = mergeProjectAttachments(
    (data ?? []) as unknown as Attachment[],
    (legacy ?? []) as Array<{ id: string; project_id: string; file_name: string; file_type: string | null; file_url: string; uploaded_at: string }>,
  );
  console.log("[attachments] fetched project attachments", {
    projectId,
    postAttachmentsCount: (data ?? []).length,
    legacyProjectFilesCount: legacy?.length ?? 0,
    totalCount: merged.length,
  });
  return merged;
}

export async function fetchAttachmentsForCapacity(capacityPostId: string): Promise<Attachment[]> {
  const { data, error } = await supabase
    .from("post_attachments" as never)
    .select("*")
    .eq("capacity_post_id", capacityPostId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  console.log("[attachments] fetched capacity attachments", {
    capacityPostId,
    totalCount: (data ?? []).length,
  });
  return (data ?? []) as unknown as Attachment[];
}

export type AttachmentSummary = { total: number; images: number; documents: number };

function isImageRow(r: { file_type: string | null; file_name: string }) {
  return isImageAttachment({ file_type: r.file_type, file_name: r.file_name });
}

export async function fetchAttachmentSummaries(params: {
  projectIds?: string[];
  capacityPostIds?: string[];
}): Promise<{ projects: Map<string, AttachmentSummary>; capacity: Map<string, AttachmentSummary> }> {
  const projects = new Map<string, AttachmentSummary>();
  const capacity = new Map<string, AttachmentSummary>();
  const bump = (m: Map<string, AttachmentSummary>, key: string, img: boolean) => {
    const cur = m.get(key) ?? { total: 0, images: 0, documents: 0 };
    cur.total += 1;
    if (img) cur.images += 1; else cur.documents += 1;
    m.set(key, cur);
  };
  if (params.projectIds?.length) {
    const { data } = await supabase
      .from("post_attachments" as never)
      .select("project_id, file_type, file_name")
      .in("project_id", params.projectIds);
    for (const r of (data ?? []) as { project_id: string; file_type: string | null; file_name: string }[]) {
      bump(projects, r.project_id, isImageRow(r));
    }
  }
  if (params.capacityPostIds?.length) {
    const { data } = await supabase
      .from("post_attachments" as never)
      .select("capacity_post_id, file_type, file_name")
      .in("capacity_post_id", params.capacityPostIds);
    for (const r of (data ?? []) as { capacity_post_id: string; file_type: string | null; file_name: string }[]) {
      bump(capacity, r.capacity_post_id, isImageRow(r));
    }
  }
  return { projects, capacity };
}

export function formatAttachmentSummary(s: AttachmentSummary | undefined): string | null {
  if (!s || s.total === 0) return null;
  if (s.images > 0 && s.documents === 0) {
    return s.images === 1 ? "1 foto" : `${s.images} foto's`;
  }
  if (s.documents > 0 && s.images === 0) {
    return s.documents === 1 ? "1 document" : `${s.documents} documenten`;
  }
  return s.total === 1 ? "1 bijlage" : `${s.total} bijlagen`;
}
