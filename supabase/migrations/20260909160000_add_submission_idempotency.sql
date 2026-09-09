begin;

-- Historical leads retain NULL; UUID uniqueness applies only to identified submissions.
alter table public.leads add column submission_id uuid;
alter table public.leads add constraint leads_submission_id_key unique (submission_id);
comment on column public.leads.submission_id is 'Technical submission UUID, separate from marketing tracking_id. First write wins; retries never mutate the lead.';

-- Remove the old non-idempotent signature: no privileged bypass left behind.
drop function public.create_lead_submission(
  text, text, text, text, text, text, text, text, text, text, text, text,
  jsonb, text, text, integer, text, text, text, text, text, text, text,
  text, text, text, text, text, text, text, text
);

-- This function is the single transactional write boundary for lead ingestion.
-- It is intentionally callable only by service_role, from an Edge Function.
create or replace function public.create_lead_submission(
  p_submission_id uuid,
  p_tracking_id text,
  p_source_form text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_company_name text,
  p_sector text,
  p_building_type text,
  p_site_size text,
  p_project_type text,
  p_solution_slug text,
  p_equipment jsonb,
  p_project_timeline text,
  p_message text,
  p_qualification_score integer,
  p_landing_page text,
  p_referrer text,
  p_cta_source text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_utm_term text,
  p_utm_content text,
  p_gclid text,
  p_gbraid text,
  p_wbraid text,
  p_fbclid text,
  p_consent_type text,
  p_policy_version text,
  p_user_agent text
)
returns table (lead_id uuid, tracking_id text, submission_id uuid, replayed boolean)
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_lead_id uuid;
  v_tracking_id text;
begin
  if p_submission_id is null then
    raise exception 'SUBMISSION_ID_REQUIRED' using errcode = '22023';
  end if;
  v_tracking_id := p_tracking_id;

  insert into public.leads (
    submission_id, tracking_id, first_name, last_name, email, phone, company_name, source_form
  ) values (
    p_submission_id, v_tracking_id, p_first_name, p_last_name, p_email, p_phone, p_company_name, p_source_form
  ) on conflict on constraint leads_submission_id_key do nothing
  returning id into v_lead_id;

  if v_lead_id is null then
    -- Separate statement: after waiting on the unique constraint, READ COMMITTED
    -- sees the winning transaction AND all its children. No no-op UPDATE/trigger.
    select l.id, l.tracking_id into v_lead_id, v_tracking_id
      from public.leads l where l.submission_id = p_submission_id;
    if not found then
      -- A concurrent administrative deletion or stricter isolation may require retry.
      raise exception 'SUBMISSION_RETRY_REQUIRED' using errcode = '40001';
    end if;
    return query select v_lead_id, v_tracking_id, p_submission_id, true;
    return;
  end if;

  insert into public.lead_needs (
    lead_id, sector, building_type, site_size, project_type, solution_slug,
    equipment, project_timeline, message, qualification_score
  ) values (
    v_lead_id, p_sector, p_building_type, p_site_size, p_project_type, p_solution_slug,
    p_equipment, p_project_timeline, p_message, p_qualification_score
  );

  insert into public.acquisitions (
    lead_id, landing_page, referrer, cta_source, utm_source, utm_medium,
    utm_campaign, utm_term, utm_content, gclid, gbraid, wbraid, fbclid
  ) values (
    v_lead_id, p_landing_page, p_referrer, p_cta_source, p_utm_source, p_utm_medium,
    p_utm_campaign, p_utm_term, p_utm_content, p_gclid, p_gbraid, p_wbraid, p_fbclid
  );

  insert into public.consents (
    lead_id, consent_type, accepted, policy_version, accepted_at, ip_hash, user_agent
  ) values (
    v_lead_id, p_consent_type, true, p_policy_version, now(), null, p_user_agent
  );

  insert into public.lead_events (lead_id, event_type, metadata)
  values (
    v_lead_id,
    'lead_created',
    jsonb_build_object('source_form', p_source_form, 'tracking_id', v_tracking_id)
  );

  return query select v_lead_id, v_tracking_id, p_submission_id, false;
end;
$$;

revoke all on function public.create_lead_submission(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text,
  jsonb, text, text, integer, text, text, text, text, text, text, text,
  text, text, text, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.create_lead_submission(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text,
  jsonb, text, text, integer, text, text, text, text, text, text, text,
  text, text, text, text, text, text, text, text
) to service_role;

commit;
