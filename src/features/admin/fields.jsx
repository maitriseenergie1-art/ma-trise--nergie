import { cloneElement, useId, useState } from 'react';
import { uploadImage } from './adminService';
import { toWebp } from './imageUtils';

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

export function ImageField({ label, value, altValue, onChange, onAltChange, nameHint }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const webp = await toWebp(file);
      const url = await uploadImage(webp, nameHint);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onInputChange = (event) => {
    handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="admin-card">
      <Field label={label} hint="Glissez-déposez une image (JPG, PNG, WebP, AVIF, SVG — max 5 Mo). Elle est automatiquement convertie en WebP et renommée pour le SEO.">
        <label
          className={`admin-dropzone${dragOver ? ' is-dragover' : ''}${busy ? ' is-busy' : ''}`}
          onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input type="file" accept="image/*" onChange={onInputChange} disabled={busy} />
          <span>{busy ? 'Conversion et téléversement…' : 'Glissez une image ici ou cliquez pour la choisir'}</span>
        </label>
      </Field>
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
