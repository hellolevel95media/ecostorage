-- Migration 11: add the promo article to the attribution view.
-- /api/inquiries now stores metadata.promoArticle (the resource page whose
-- ?promo= link brought the visitor). `create or replace view` can only append
-- columns, so promo_article goes last; existing grants are kept.
create or replace view social.inquiries_attribution as
select
  id,
  created_at,
  type as form_type,
  coalesce(metadata ->> 'source', type) as source,
  metadata -> 'affiliate' ->> 'promoCode' as promo_code,
  utm_source, utm_medium, utm_campaign, utm_content, landing_path, referrer_host,
  metadata ->> 'promoArticle' as promo_article
from public.inquiries;
