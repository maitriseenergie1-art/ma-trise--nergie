export function StatCard({ label, value, hint, tone }) {
  return (
    <div className="admin-card admin-stat-card">
      <div className="admin-stat-label">{label}</div>
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
export function BarList({ title, items, total, format }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const sum = total ?? items.reduce((s, i) => s + i.count, 0);
  return (
    <div className="admin-card">
      {title && <h3>{title}</h3>}
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

export function Loading({ label = 'Chargement…' }) {
  return <div className="admin-loading"><span aria-hidden="true" /> <p className="hint">{label}</p></div>;
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <p className="admin-error">{error.message || String(error)}</p>;
}
