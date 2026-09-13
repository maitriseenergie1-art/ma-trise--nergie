import { cloneElement, useId, useState } from 'react';
import { uploadImage } from './adminService';

export function slugify(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function Field({ label, hint, children }) {
  const generatedId = useId();
  const fieldId = children.props.id || generatedId;
  return (
    <div className="admin-field">
      <label htmlFor={fieldId}>{label}</label>
      {cloneElement(children, { id: fieldId })}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function TextField({ label, hint, value, onChange, ...rest }) {
  return (
    <Field label={label} hint={hint}>
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
    </Field>
  );
}

export function TextArea({ label, hint, value, onChange, rows = 5, ...rest }) {
  return (
    <Field label={label} hint={hint}>
      <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
    </Field>
  );
}

export function SelectField({ label, hint, value, onChange, options }) {
  return (
    <Field label={label} hint={hint}>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function TagsField({ label, hint = 'Séparez les valeurs par une virgule.', value, onChange }) {
  return (
    <TextField
      label={label}
      hint={hint}
      value={(value || []).join(', ')}
      onChange={(raw) =>
        onChange(
          raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

export function ImageField({ label, value, altValue, onChange, onAltChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };
  return (
    <div className="admin-card">
      <Field label={label} hint="Formats acceptés : JPG, PNG, WebP, AVIF, SVG (max 5 Mo).">
        <input type="file" accept="image/*" onChange={handleFile} disabled={busy} />
      </Field>
      {busy && <p className="hint">Téléversement…</p>}
      {error && <p className="admin-error">{error}</p>}
      <TextField
        label="URL de l’image"
        value={value}
        onChange={onChange}
        placeholder="https://…"
      />
      {value && <img className="admin-image-preview" src={value} alt="" />}
      {onAltChange && (
        <TextField
          label="Texte alternatif (accessibilité / SEO)"
          value={altValue}
          onChange={onAltChange}
          placeholder="Décrivez l’image en une phrase"
        />
      )}
    </div>
  );
}
