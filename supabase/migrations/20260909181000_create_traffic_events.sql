begin;

-- ---------------------------------------------------------------------------
-- Lightweight first-party web analytics.
-- Written only by the /api/track Netlify Function (service_role). No browser
-- role can read or write this table.
-- ---------------------------------------------------------------------------
create table public.traffic_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'click', 'form_view', 'form_submit')),
  session_id text,
  path text not null,
  title text,
  -- click / form events
  target text,
  target_kind text,
  -- attribution
  referrer text,
  referrer_host text,
  source text,
  source_label text,
  source_group text check (source_group is null or source_group in (
    'ai', 'search', 'social', 'referral', 'direct', 'paid', 'other'
  )),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  -- context
  device text,
  country text,
  is_bot boolean not null default false,
  created_at timestamptz not null default now()
);

create index traffic_events_created_at_idx on public.traffic_events (created_at desc);
create index traffic_events_type_created_idx on public.traffic_events (event_type, created_at desc);
create index traffic_events_path_idx on public.traffic_events (path);
create index traffic_events_source_idx on public.traffic_events (source);
create index traffic_events_session_idx on public.traffic_events (session_id);

alter table public.traffic_events enable row level security;
revoke all on public.traffic_events from anon, authenticated;
-- No policies: browser roles have no access. Server code uses service_role.

commit;
