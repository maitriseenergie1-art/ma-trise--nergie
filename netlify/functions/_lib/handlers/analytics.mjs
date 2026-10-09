import { admin } from '../supabaseAdmin.mjs';
import { json } from '../http.mjs';

const DAY = 86400000;
const monthKey = (d) => new Date(d).toISOString().slice(0, 7);
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

function tally(rows, keyFn) {
  const out = {};
  for (const row of rows) {
    const k = keyFn(row);
    if (k == null || k === '') continue;
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

const toSorted = (obj, limit) =>
  Object.entries(obj)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit ?? 1000);

// Événements d'engagement stockés comme « click » avec un target_kind dédié (voir formTracking.js) :
// ils ne comptent pas dans les clics « boutons et liens ».
const ENGAGEMENT_KINDS = new Set(['form_start', 'form_step', 'form_error', 'scroll']);

// Parcours par visiteur (session) : d'où il arrive, ce qu'il lit, s'il voit / commence / envoie un formulaire.
function conversionReport(T) {
  const sessions = new Map();
  for (const e of T) {
    if (!e.session_id) continue;
    let s = sessions.get(e.session_id);
    if (!s) {
      s = { pages: new Set(), first: null, firstAt: '', group: null, device: null, clicks: 0, cta: 0, scroll: {}, viewed: new Set(), started: new Set(), submitted: new Set(), steps: {} };
      sessions.set(e.session_id, s);
    }
    const kind = e.target_kind;
    if (e.event_type === 'page_view') {
      s.pages.add(e.path);
      if (!s.firstAt || e.created_at < s.firstAt) { s.firstAt = e.created_at; s.first = e.path; s.group = e.source_group || 'other'; s.device = e.device || 'inconnu'; }
    } else if (e.event_type === 'form_view') s.viewed.add(e.target);
    else if (e.event_type === 'form_submit') s.submitted.add(e.target);
    else if (e.event_type === 'click') {
      if (kind === 'form_start') s.started.add(e.target);
      else if (kind === 'form_step') { const [type, step] = String(e.target).split(':'); (s.steps[type] ||= new Set()).add(Number(step)); }
      else if (kind === 'scroll') { (s.scroll[e.path] ||= new Set()).add(Number(e.target)); }
      else if (!ENGAGEMENT_KINDS.has(kind)) { s.clicks += 1; if (kind === 'cta' || kind === 'contact') s.cta += 1; }
    }
  }
  const all = [...sessions.values()].filter((s) => s.pages.size > 0);
  const any = (set) => set.size > 0;
  const engaged = (s) => s.pages.size > 1 || s.clicks > 0;
  const funnel = [
    { key: 'visitors', count: all.length },
    { key: 'formSeen', count: all.filter((s) => any(s.viewed)).length },
    { key: 'formStarted', count: all.filter((s) => any(s.started)).length },
    { key: 'formSubmitted', count: all.filter((s) => any(s.submitted)).length },
  ];

  const forms = {};
  const formRow = (type) => (forms[type] ||= { form: type, views: 0, starts: 0, submits: 0, errors: 0 });
  for (const s of all) {
    s.viewed.forEach((t) => { formRow(t).views += 1; });
    s.started.forEach((t) => { formRow(t).starts += 1; });
    s.submitted.forEach((t) => { formRow(t).submits += 1; });
  }
  const errorsByField = {};
  for (const e of T) {
    if (e.event_type === 'click' && e.target_kind === 'form_error') {
      errorsByField[e.target] = (errorsByField[e.target] ?? 0) + 1;
      formRow(String(e.target).split(':')[0]).errors += 1;
    }
  }
  const eligibilitySteps = {};
  for (const s of all) (s.steps.eligibility || new Set()).forEach((n) => { eligibilitySteps[n] = (eligibilitySteps[n] ?? 0) + 1; });

  const segment = (keyFn) => {
    const groups = {};
    for (const s of all) {
      const k = keyFn(s);
      const g = (groups[k] ||= { key: k, sessions: 0, engaged: 0, submitted: 0 });
      g.sessions += 1;
      if (engaged(s)) g.engaged += 1;
      if (any(s.submitted)) g.submitted += 1;
    }
    return Object.values(groups).sort((a, b) => b.sessions - a.sessions);
  };

  const landing = {};
  for (const s of all) {
    const g = (landing[s.first] ||= { path: s.first, sessions: 0, engaged: 0, cta: 0, scroll50: 0, scroll100: 0, formSeen: 0, submitted: 0 });
    g.sessions += 1;
    if (engaged(s)) g.engaged += 1;
    if (s.cta > 0) g.cta += 1;
    const sc = s.scroll[s.first];
    if (sc && (sc.has(50) || sc.has(75) || sc.has(100))) g.scroll50 += 1;
    if (sc?.has(100)) g.scroll100 += 1;
    if (any(s.viewed)) g.formSeen += 1;
    if (any(s.submitted)) g.submitted += 1;
  }

  return {
    // Faux tant que le suivi détaillé (début de remplissage, scroll, erreurs) n'a rien enregistré.
    engagementTracked: T.some((e) => e.event_type === 'click' && ENGAGEMENT_KINDS.has(e.target_kind)),
    sessions: all.length,
    singlePage: all.filter((s) => !engaged(s)).length,
    pagesPerSession: all.length ? Math.round((all.reduce((n, s) => n + s.pages.size, 0) / all.length) * 10) / 10 : 0,
    funnel,
    forms: Object.values(forms).sort((a, b) => b.views - a.views),
    errorsByField: toSorted(errorsByField, 12),
    eligibilitySteps: Object.entries(eligibilitySteps).map(([step, count]) => ({ step: Number(step), count })).sort((a, b) => a.step - b.step),
    bySource: segment((s) => s.group),
    byDevice: segment((s) => s.device),
    landingPages: Object.values(landing).sort((a, b) => b.sessions - a.sessions).slice(0, 15),
  };
}

async function safeSelect(table, columns, sinceIso) {
  try {
    let q = admin.from(table).select(columns).limit(50000);
    if (sinceIso) q = q.gte('created_at', sinceIso);
    const { data, error } = await q;
    if (error) return { rows: [], available: false, error: error.message };
    return { rows: data ?? [], available: true };
  } catch (e) {
    return { rows: [], available: false, error: e.message };
  }
}

export async function dashboard() {
  const now = Date.now();
  const since30 = new Date(now - 30 * DAY).toISOString();
  const since7 = new Date(now - 7 * DAY).toISOString();

  const [leads, needs, caseStudies, blogPosts, traffic] = await Promise.all([
    safeSelect('leads', 'id,created_at,status,source_form,company_name,email,first_name,last_name'),
    safeSelect('lead_needs', 'sector,qualification_score,created_at'),
    safeSelect('case_studies', 'id,status'),
    safeSelect('blog_posts', 'id,status'),
    safeSelect('traffic_events', 'event_type,path,source,source_group,created_at', since7),
  ]);

  const L = leads.rows;
  const won = L.filter((l) => ['won', 'completed'].includes(l.status)).length;
  const lost = L.filter((l) => l.status === 'lost').length;

  const recent = [...L]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)
    .map((l) => ({
      id: l.id,
      createdAt: l.created_at,
      status: l.status,
      sourceForm: l.source_form,
      label: l.company_name || [l.first_name, l.last_name].filter(Boolean).join(' ') || l.email || '—',
    }));

  const pageViews = traffic.rows.filter((e) => e.event_type === 'page_view');

  return json({
    generatedAt: new Date().toISOString(),
    leads: {
      total: L.length,
      last7: L.filter((l) => l.created_at >= since7).length,
      last30: L.filter((l) => l.created_at >= since30).length,
      byStatus: tally(L, (l) => l.status),
      bySourceForm: tally(L, (l) => l.source_form),
      won,
      lost,
      conversionRate: L.length ? Math.round((won / L.length) * 1000) / 10 : 0,
      avgScore: needs.rows.length
        ? Math.round(
            (needs.rows.reduce((s, n) => s + (n.qualification_score ?? 0), 0) /
              needs.rows.filter((n) => n.qualification_score != null).length || 0) * 10,
          ) / 10
        : null,
      recent,
    },
    content: {
      caseStudies: {
        published: caseStudies.rows.filter((c) => c.status === 'published').length,
        draft: caseStudies.rows.filter((c) => c.status === 'draft').length,
      },
      blogPosts: {
        published: blogPosts.rows.filter((p) => p.status === 'published').length,
        draft: blogPosts.rows.filter((p) => p.status === 'draft').length,
      },
    },
    traffic: {
      available: traffic.available,
      last7Views: pageViews.length,
      last7Sessions: new Set(pageViews.map((e) => e.path + e.created_at.slice(0, 13))).size,
      topSources: toSorted(tally(pageViews, (e) => e.source), 6),
      byGroup: tally(pageViews, (e) => e.source_group || 'other'),
    },
  });
}

export async function stats(url) {
  const days = Math.min(365, Math.max(7, Number(url.searchParams.get('days')) || 90));
  const sinceIso = new Date(Date.now() - days * DAY).toISOString();

  const [leads, needs, acquisitions, events, traffic] = await Promise.all([
    safeSelect('leads', 'id,created_at,status,source_form', sinceIso),
    safeSelect('lead_needs', 'lead_id,sector,project_type,qualification_score'),
    safeSelect('acquisitions', 'lead_id,utm_source,utm_medium,utm_campaign,referrer,landing_page'),
    safeSelect('lead_events', 'lead_id,event_type,metadata,created_at'),
    safeSelect('traffic_events', 'event_type,path,target,target_kind,session_id,source,source_label,source_group,referrer_host,device,is_bot,created_at', sinceIso),
  ]);

  const L = leads.rows;
  const leadIds = new Set(L.map((lead) => lead.id));
  const N = needs.rows.filter((need) => leadIds.has(need.lead_id));
  const A = acquisitions.rows.filter((acquisition) => leadIds.has(acquisition.lead_id));
  const funnelOrder = ['new', 'to_contact', 'contacted', 'qualified', 'appointment', 'proposal', 'won', 'lost'];

  const T = traffic.rows.filter((e) => !e.is_bot);
  const views = T.filter((e) => e.event_type === 'page_view');
  const clicks = T.filter((e) => e.event_type === 'click' && !ENGAGEMENT_KINDS.has(e.target_kind));
  const formViews = T.filter((e) => e.event_type === 'form_view');
  const formSubmits = T.filter((e) => e.event_type === 'form_submit');
  const daysByKey = new Map();
  for (const event of T) {
    const key = dayKey(event.created_at);
    if (!daysByKey.has(key)) daysByKey.set(key, { key, views: 0, clicks: 0, formViews: 0, formSubmits: 0, leads: 0 });
    const row = daysByKey.get(key);
    if (event.event_type === 'page_view') row.views += 1;
    if (event.event_type === 'click' && !ENGAGEMENT_KINDS.has(event.target_kind)) row.clicks += 1;
    if (event.event_type === 'form_view') row.formViews += 1;
    if (event.event_type === 'form_submit') row.formSubmits += 1;
  }
  for (const lead of L) {
    const key = dayKey(lead.created_at);
    if (!daysByKey.has(key)) daysByKey.set(key, { key, views: 0, clicks: 0, formViews: 0, formSubmits: 0, leads: 0 });
    daysByKey.get(key).leads += 1;
  }

  return json({
    range: { days, since: sinceIso },
    leads: {
      total: L.length,
      byMonth: toSorted(tally(L, (l) => monthKey(l.created_at))).sort((a, b) => a.key.localeCompare(b.key)),
      bySourceForm: tally(L, (l) => l.source_form),
      byStatus: tally(L, (l) => l.status),
      bySector: toSorted(tally(N, (n) => n.sector), 12),
      byProjectType: toSorted(tally(N, (n) => n.project_type), 12),
      funnel: funnelOrder.map((status) => ({ status, count: L.filter((l) => l.status === status).length })),
      utmSource: toSorted(tally(A, (a) => a.utm_source), 12),
      utmCampaign: toSorted(tally(A, (a) => a.utm_campaign), 12),
    },
    traffic: {
      available: traffic.available,
      totalViews: views.length,
      uniqueSessions: new Set(views.map((event) => event.session_id).filter(Boolean)).size,
      totalClicks: clicks.length,
      formViews: formViews.length,
      formSubmits: formSubmits.length,
      formConversionRate: formViews.length ? Math.round((formSubmits.length / formViews.length) * 1000) / 10 : 0,
      phoneClicks: clicks.filter((event) => event.target === 'phone').length,
      conversion: conversionReport(T),
      timeline: [...daysByKey.values()].sort((a, b) => a.key.localeCompare(b.key)),
      byDay: toSorted(tally(views, (e) => dayKey(e.created_at))).sort((a, b) => a.key.localeCompare(b.key)),
      viewsByPath: toSorted(tally(views, (e) => e.path), 25),
      clicksByPath: toSorted(tally(clicks, (e) => e.path), 25),
      clicksByTarget: toSorted(tally(clicks, (e) => e.target), 25),
      sources: toSorted(tally(views, (e) => e.source_label || e.source), 20),
      byGroup: tally(views, (e) => e.source_group || 'other'),
      aiEngines: toSorted(
        tally(views.filter((e) => e.source_group === 'ai'), (e) => e.source_label || e.source),
        12,
      ),
      devices: toSorted(tally(views, (e) => e.device), 8),
      referrerHosts: toSorted(tally(views, (e) => e.referrer_host), 20),
    },
  });
}
