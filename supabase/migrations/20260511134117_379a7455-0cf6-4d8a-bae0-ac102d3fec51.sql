-- Public bucket for company logos and user avatars
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do update set public = true;

-- Public can read logos
create policy "Public read company-logos"
on storage.objects for select
using (bucket_id = 'company-logos');

-- Authenticated users can upload to their own folder (first path segment = auth.uid())
create policy "Auth upload own company-logos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'company-logos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Auth update own company-logos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'company-logos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Auth delete own company-logos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'company-logos'
  and auth.uid()::text = (storage.foldername(name))[1]
);