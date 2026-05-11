import { supabase } from "@/lib/supabase";

export type Attachment = {
  id: string;
  project_id: string | null;
  capacity_post_id: string | null;
  uploaded_by: string;
  file_name: string;
  file_type: string | null;
  file_url: string;
  storage_path: string;
  created_at: string;
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
    const up = await supabase.storage.from("project-files").upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (up.error) { failed.push(file.name); continue; }
    const { data: pub } = supabase.storage.from("project-files").getPublicUrl(up.data.path);
    const { error: insErr } = await supabase.from("post_attachments" as never).insert({
      project_id: target.projectId ?? null,
      capacity_post_id: target.capacityPostId ?? null,
      uploaded_by: userId,
      file_name: file.name,
      file_type: file.type || null,
      file_url: pub.publicUrl,
      storage_path: up.data.path,
    } as never);
    if (insErr) {
      await supabase.storage.from("project-files").remove([up.data.path]);
      failed.push(file.name);
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
  return (data ?? []) as unknown as Attachment[];
}

export async function fetchAttachmentsForCapacity(capacityPostId: string): Promise<Attachment[]> {
  const { data, error } = await supabase
    .from("post_attachments" as never)
    .select("*")
    .eq("capacity_post_id", capacityPostId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Attachment[];
}

export async function fetchAttachmentCounts(params: {
  projectIds?: string[];
  capacityPostIds?: string[];
}): Promise<{ projects: Map<string, number>; capacity: Map<string, number> }> {
  const projects = new Map<string, number>();
  const capacity = new Map<string, number>();
  if (params.projectIds?.length) {
    const { data } = await supabase
      .from("post_attachments" as never)
      .select("project_id")
      .in("project_id", params.projectIds);
    for (const r of (data ?? []) as { project_id: string }[]) {
      projects.set(r.project_id, (projects.get(r.project_id) ?? 0) + 1);
    }
  }
  if (params.capacityPostIds?.length) {
    const { data } = await supabase
      .from("post_attachments" as never)
      .select("capacity_post_id")
      .in("capacity_post_id", params.capacityPostIds);
    for (const r of (data ?? []) as { capacity_post_id: string }[]) {
      capacity.set(r.capacity_post_id, (capacity.get(r.capacity_post_id) ?? 0) + 1);
    }
  }
  return { projects, capacity };
}
