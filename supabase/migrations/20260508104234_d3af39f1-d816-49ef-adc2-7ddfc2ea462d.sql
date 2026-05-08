
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

create policy "Public can read project files"
on storage.objects for select
using (bucket_id = 'project-files');

create policy "Authenticated can upload project files"
on storage.objects for insert to authenticated
with check (bucket_id = 'project-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners can update own project files"
on storage.objects for update to authenticated
using (bucket_id = 'project-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners can delete own project files"
on storage.objects for delete to authenticated
using (bucket_id = 'project-files' and (storage.foldername(name))[1] = auth.uid()::text);
