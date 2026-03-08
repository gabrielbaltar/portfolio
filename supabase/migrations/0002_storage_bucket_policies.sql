grant select, update on table storage.buckets to authenticated;

drop policy if exists "cms_read_storage_buckets" on storage.buckets;
create policy "cms_read_storage_buckets" on storage.buckets
for select to authenticated
using (id in ('portfolio-public', 'portfolio-private'));

drop policy if exists "cms_update_storage_buckets" on storage.buckets;
create policy "cms_update_storage_buckets" on storage.buckets
for update to authenticated
using (id in ('portfolio-public', 'portfolio-private'))
with check (id in ('portfolio-public', 'portfolio-private'));
