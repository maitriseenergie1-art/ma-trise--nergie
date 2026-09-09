begin;

-- Refine the commercial lifecycle without changing the already-created migration.
-- Status updates and their history event remain one PostgreSQL transaction.
create or replace function public.update_lead_status(
  p_lead_id uuid,
  p_new_status text,
  p_lost_reason text default null
)
returns table (lead_id uuid, previous_status text, current_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_previous_status text;
  v_lost_reasons constant text[] := array['budget', 'timing', 'not_qualified', 'no_response', 'competitor', 'other'];
begin
  select status into v_previous_status
  from public.leads
  where id = p_lead_id
  for update;

  if not found then
    return;
  end if;

  if p_new_status not in ('new', 'to_contact', 'contacted', 'qualified', 'appointment', 'proposal', 'won', 'lost', 'completed') then
    raise exception 'INVALID_STATUS' using errcode = '22023';
  end if;

  if p_new_status = v_previous_status then
    raise exception 'STATUS_UNCHANGED' using errcode = '22023';
  end if;

  if (p_new_status = 'lost' and p_lost_reason is null)
    or (p_new_status <> 'lost' and p_lost_reason is not null)
    or (p_new_status = 'lost' and p_lost_reason <> all(v_lost_reasons)) then
    raise exception 'INVALID_LOST_REASON' using errcode = '22023';
  end if;

  if not (
    (v_previous_status = 'new' and p_new_status in ('to_contact', 'contacted', 'qualified', 'appointment', 'proposal', 'lost'))
    or (v_previous_status = 'to_contact' and p_new_status in ('contacted', 'qualified', 'appointment', 'proposal', 'lost'))
    or (v_previous_status = 'contacted' and p_new_status in ('qualified', 'appointment', 'proposal', 'lost'))
    or (v_previous_status = 'qualified' and p_new_status in ('appointment', 'proposal', 'lost'))
    or (v_previous_status = 'appointment' and p_new_status in ('proposal', 'lost'))
    or (v_previous_status = 'proposal' and p_new_status in ('won', 'lost'))
    or (v_previous_status = 'won' and p_new_status = 'completed')
    or (v_previous_status = 'lost' and p_new_status in ('to_contact', 'contacted', 'qualified'))
  ) then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = '22023';
  end if;

  update public.leads
  set status = p_new_status
  where id = p_lead_id;

  insert into public.lead_events (lead_id, event_type, metadata)
  values (
    p_lead_id,
    'lead_status_changed',
    jsonb_strip_nulls(jsonb_build_object(
      'from', v_previous_status,
      'to', p_new_status,
      'lost_reason', case when p_new_status = 'lost' then p_lost_reason else null end
    ))
  );

  return query select p_lead_id, v_previous_status, p_new_status;
end;
$$;

revoke all on function public.update_lead_status(uuid, text, text) from public, anon, authenticated;
grant execute on function public.update_lead_status(uuid, text, text) to service_role;

commit;
