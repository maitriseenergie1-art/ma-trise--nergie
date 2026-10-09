import { useEffect, useId, useRef, useState } from 'react';

// Bulle d'aide « i » : s'ouvre au clic / toucher / clavier, se ferme avec Échap ou un clic ailleurs.
export function InfoTip({ children, label = 'Explication' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (event.type === 'keydown' ? event.key === 'Escape' : !ref.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); document.removeEventListener('keydown', close); };
  }, [open]);
  return (
    <span className="admin-info" ref={ref}>
      <button type="button" className="admin-info-btn" aria-label={label} aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>i</button>
      {open && <span className="admin-info-pop" role="note" id={id}>{children}</span>}
    </span>
  );
}

export function StatCard({ label, value, hint, tone, info }) {
  return (
    <div className="admin-card admin-stat-card">
      <div className="admin-stat-label">{label}{info && <InfoTip label={`Explication : ${label}`}>{info}</InfoTip>}</div>
      <div className={`admin-stat-value ${tone === 'accent' ? 'accent' : ''}`}>{value}</div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function CardGrid({ children, min = 180 }) {
  return (
    <div className="admin-card-grid" style={{ '--card-min': `${min}px` }}>
      {children}
    </div>
  );
}

// Horizontal bar list — no chart library, readable in both themes.
export function BarList({ title, items, total, format, info }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const sum = total ?? items.reduce((s, i) => s + i.count, 0);
  return (
    <div className="admin-card">
      {title && <h3>{title}{info && <InfoTip label={`Explication : ${title}`}>{info}</InfoTip>}</h3>}
      {items.length === 0 && <p className="hint">Aucune donnée.</p>}
      <div className="admin-bar-list">
        {items.map((item) => (
          <div className="admin-bar-row" key={item.key}>
            <div className="admin-bar-copy">
              <div className="admin-bar-label" title={format ? format(item.key) : item.key}>
                {format ? format(item.key) : item.key}
              </div>
              <div className="admin-bar-track">
                <div className="admin-bar-fill" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </div>
            <div className="admin-bar-value">
              {item.count}
              {sum ? ` · ${Math.round((item.count / sum) * 100)}%` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Spark({ data }) {
  if (!data?.length) return null;
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="admin-spark" role="img" aria-label="Évolution des données sur la période">
      {data.map((d) => (
        <div
          className="admin-spark-bar"
          key={d.key}
          title={`${d.key} : ${d.count}`}
          style={{ height: `${(d.count / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

export function TrendChart({ data = [], series = [], ariaLabel = 'Évolution des indicateurs' }) {
  if (!data.length || !series.length) return <p className="hint">Aucune donnée sur cette période.</p>;
  const width = 720; const height = 220; const padding = { top: 18, right: 12, bottom: 30, left: 38 };
  const max = Math.max(1, ...data.flatMap((row) => series.map((item) => Number(row[item.key]) || 0)));
  const x = (index) => padding.left + (index * (width - padding.left - padding.right)) / Math.max(1, data.length - 1);
  const y = (value) => height - padding.bottom - ((Number(value) || 0) / max) * (height - padding.top - padding.bottom);
  const path = (key) => data.map((row, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)},${y(row[key]).toFixed(1)}`).join(' ');
  const ticks = [0, Math.ceil(max / 2), max];
  return <div className="admin-trend" role="img" aria-label={ariaLabel}><div className="admin-trend-legend">{series.map((item) => <span key={item.key}><i style={{ background: item.color }}/>{item.label}</span>)}</div><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">{ticks.map((value) => <g key={value}><line x1={padding.left} x2={width-padding.right} y1={y(value)} y2={y(value)} className="admin-trend-grid"/><text x="0" y={y(value)+4}>{value}</text></g>)}{series.map((item) => <path key={item.key} d={path(item.key)} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>)}{[0, data.length - 1].filter((index, position, all) => index >= 0 && all.indexOf(index) === position).map((index) => <text key={index} x={x(index)} y={height - 8} textAnchor={index === 0 ? 'start' : 'end'}>{new Date(`${data[index].key}T00:00:00`).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}</text>)}</svg></div>;
}

export function Loading({ label = 'Chargement…' }) {
  return <div className="admin-loading"><span aria-hidden="true" /> <p className="hint">{label}</p></div>;
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <p className="admin-error">{error.message || String(error)}</p>;
}

const DONUT_COLORS = ['#0b5f73', '#b7d633', '#c56a39', '#4e94c8', '#7a5ea8', '#d9a21b', '#8a9aa0'];

// Camembert (anneau) en SVG pur : au-delà de 6 parts, le reste est regroupé dans « Autres ».
export function DonutChart({ title, info, items = [], unit = 'visites', empty = 'Pas encore de données sur cette période.' }) {
  const sorted = items.filter((i) => i.count > 0).sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 6);
  const rest = sorted.slice(6).reduce((sum, i) => sum + i.count, 0);
  const parts = rest ? [...top, { key: 'Autres', count: rest }] : top;
  const total = parts.reduce((sum, i) => sum + i.count, 0);
  const radius = 15.915; // circonférence = 100
  let offset = 0;
  return (
    <div className="admin-card admin-donut-card">
      <h3>{title}{info && <InfoTip label={`Explication : ${title}`}>{info}</InfoTip>}</h3>
      {!total ? <p className="hint">{empty}</p> : (
        <div className="admin-donut">
          <div className="admin-donut-figure">
            <svg viewBox="0 0 42 42" role="img" aria-label={`${title} : ${parts.map((p) => `${p.key} ${Math.round((p.count / total) * 100)} %`).join(', ')}`}>
              <circle cx="21" cy="21" r={radius} fill="none" stroke="#eef2f3" strokeWidth="6" />
              {parts.map((part, index) => {
                const share = (part.count / total) * 100;
                const gap = parts.length > 1 ? 0.6 : 0;
                const circle = <circle key={part.key} cx="21" cy="21" r={radius} fill="none" stroke={DONUT_COLORS[index % DONUT_COLORS.length]} strokeWidth="6" strokeDasharray={`${Math.max(0, share - gap)} ${100 - Math.max(0, share - gap)}`} strokeDashoffset={25 - offset} />;
                offset += share;
                return circle;
              })}
            </svg>
            <div className="admin-donut-center"><strong>{total}</strong><span>{unit}</span></div>
          </div>
          <ul className="admin-donut-legend">
            {parts.map((part, index) => (
              <li key={part.key}><i style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }} /><span>{part.key}</span><b>{Math.round((part.count / total) * 100)} %</b><small>{part.count}</small></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
