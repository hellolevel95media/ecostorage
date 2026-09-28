-- ---------------------------------------------------------------------------
-- Cap what the public 'media' bucket will accept. Previously any file type
-- of any size could be uploaded (enforced neither client-side nor server-
-- side), which is risky for a bucket served publicly straight off its own
-- URL — e.g. an uploaded .html/.svg file executing script in that origin.
-- Restricting to known image/video MIME types and a sane size ceiling is
-- enforced by Supabase Storage itself, not just the app.
-- ---------------------------------------------------------------------------
update storage.buckets
set
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = array[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
where id = 'media';
