begin;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  tracking_id text,
  first_name text,
  last_name text,
  email text,
  phone text,
  company_name text,
  status text not null default 'new' check (status in (
    'new', 'to_contact', 'contacted', 'qualified', 'appointment',
    'proposal', 'won', 'lost', 'completed'
  )),
  source_form text not null check (source_form in ('contact', 'eligibility', 'landing_page', 'campaign')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_email_format_check check (email is null or position('@' in email) > 1),
  constraint leads_contact_details_check check (
    email is not null or phone is not null or company_name is not null
  )
);

create table public.lead_needs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  sector text,
  building_type text,
  site_size text,
  project_type text,
  solution_slug text,
  equipment jsonb,
  project_timeline text,
  message text,
  qualification_score integer check (qualification_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.acquisitions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  landing_page text,
  referrer text,
  cta_source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  gbraid text,
  wbraid text,
  fbclid text,
  created_at timestamptz not null default now()
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  consent_type text not null check (length(trim(consent_type)) > 0),
  accepted boolean not null,
  policy_version text,
  accepted_at timestamptz,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint consents_accepted_at_check check (not accepted or accepted_at is not null)
);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  event_type text not null check (length(trim(event_type)) > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index leads_email_idx on public.leads (email);
create index leads_tracking_id_idx on public.leads (tracking_id);
create index leads_status_idx on public.leads (status);
create index leads_created_at_idx on public.leads (created_at desc);
create index lead_needs_lead_id_idx on public.lead_needs (lead_id);
create index acquisitions_lead_id_idx on public.acquisitions (lead_id);
create index acquisitions_utm_source_idx on public.acquisitions (utm_source);
create index acquisitions_utm_campaign_idx on public.acquisitions (utm_campaign);
create index lead_events_lead_id_idx on public.lead_events (lead_id);
create index lead_events_event_type_idx on public.lead_events (event_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.lead_needs enable row level security;
alter table public.acquisitions enable row level security;
alter table public.consents enable row level security;
alter table public.lead_events enable row level security;

-- No policies are created intentionally. Browser roles cannot read, write,
-- update or delete lead data; a future server API or Edge Function will use
-- a privileged server-side role after validation and anti-spam checks.
revoke all on public.leads from anon, authenticated;
revoke all on public.lead_needs from anon, authenticated;
revoke all on public.acquisitions from anon, authenticated;
revoke all on public.consents from anon, authenticated;
revoke all on public.lead_events from anon, authenticated;

commit;
