-- Storage + moving wording (2026-10-13). Content only, no schema change.
-- These rows override the code fallbacks, so they must change together with
-- the website deploy that adds the moving banner and calculator tick box.
-- Run once, the same day `main` is pushed:
--   Supabase SQL editor (project dqmuuszmuyixjxonwjpv), or ask Claude.

begin;

update public.sections set subheading =
  'Storage and moving from one team. We collect, store and deliver back across Singapore, at a fixed S$350 per full 14ft truckload, with climate-controlled units when you need them.',
  updated_at = now()
where section_key = 'hero' and page_id = (select id from public.pages where slug = 'home');

update public.sections set subheading =
  'From dorm move-outs to full-home moves, our operations team collects, stores and delivers back on your schedule, at S$350 per full 14ft truckload.',
  updated_at = now()
where section_key = 'hero' and page_id = (select id from public.pages where slug = 'personal');

update public.sections set body =
  E'Whichever service you choose, the same standards apply, because your belongings matter to you.\n'
  '- Wrapped and protected: Pallets are shrink-wrapped, and sensitive items can move into enclosed crates for extra peace of mind.\n'
  '- Logged and tracked: Everything is recorded against your account, so partial returns are simple and nothing is left to memory.\n'
  '- Scheduling you can rely on: We will keep you updated if timings change, so you can plan your day with confidence.\n'
  '- Pricing that makes sense: A fixed S$350 per full 14ft truckload, itemised quotes for everything else, and any extra communicated before we do it.',
  updated_at = now()
where section_key = 'trust_segment' and page_id = (select id from public.pages where slug = 'services');

update public.services set description =
  'Collection and delivery at a guaranteed S$350 per full 14ft truckload, with complimentary partial extraction so you only get back what you need. Upgrade to Premium Valet for full inventory cataloging and box-level labeling on everything we receive.',
  updated_at = now()
where slug = 'valet-storage';

update public.services set description =
  'Full-service home moves by our operations team, at S$350 per full 14ft truckload. We pack, transport and set up at your new address, and can store anything you don''t need right away. Any extras are communicated in advance.',
  updated_at = now()
where slug = 'home-moving';

update public.services set description =
  'Relocate your office with minimal downtime. Our operations team handles furniture, equipment and document transport, stores overflow items until your new space is ready, and agrees any extras with you in advance.',
  updated_at = now()
where slug = 'office-moving';

update public.services set description =
  'Let our team handle the packing — proper materials, careful wrapping for fragile items, and a labeled inventory so nothing gets lost in the shuffle. Fragile wrapping is matched to each item and priced before we start.',
  updated_at = now()
where slug = 'packing-service';

commit;
