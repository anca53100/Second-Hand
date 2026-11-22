import { useRef, useState } from 'react';
import { resizeImage } from '../../utils/image.js';

export const MAX_PHOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png'];

function hintFor(count) {
  if (count === 0) return `JPG o PNG, hasta 5 MB cada una. Puedes subir hasta ${MAX_PHOTOS}.`;
  if (count === 1) return `1 de ${MAX_PHOTOS} fotos. Agrega más para mostrar otros ángulos.`;
  return `${count} de ${MAX_PHOTOS} fotos. Elige una miniatura para usarla de portada.`;
}

export default function PhotoUploader({ value, onChange, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const room = MAX_PHOTOS - value.length;
  const open = () => { if (room > 0 && !busy) inputRef.current?.click(); };

  const addFiles = async (fileList) => {
    const files = [...(fileList ?? [])];
    if (!files.length || busy) return;
    if (room <= 0) { setLocalError(`Ya tienes ${MAX_PHOTOS} fotos. Quita una para agregar otra.`); return; }

    const valid = files.filter((f) => ACCEPTED.includes(f.type) && f.size <= MAX_BYTES);
    let problem = valid.length < files.length ? 'Algunas imágenes no se agregaron: solo se permiten JPG o PNG de hasta 5 MB.' : '';
    if (valid.length > room) problem = `Puedes subir máximo ${MAX_PHOTOS} fotos; agregamos las primeras ${room}.`;
    setLocalError(problem);
    if (!valid.length) return;

    setBusy(true);
    try {
      const added = [];
      for (const file of valid.slice(0, room)) added.push(await resizeImage(file));
      onChange([...new Set([...value, ...added])]);
    } catch {
      setLocalError('No pudimos leer una de las imágenes. Prueba con otra.');
    } finally {
      setBusy(false);
    }
  };

  const remove = (index) => { setLocalError(''); onChange(value.filter((_, i) => i !== index)); };
  const makeCover = (index) => onChange([value[index], ...value.filter((_, i) => i !== index)]);
  const message = error || localError;

  return (
    <div
      className={`photos${dragging ? ' is-dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
    >
      {value.length === 0 ? (
        <div
          className={`dropzone${dragging ? ' is-dragging' : ''}`}
          role="button" tabIndex={0} aria-label="Agregar fotografías"
          onClick={open}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 16-5-5-8 8" />
          </svg>
          <span>{busy ? 'Procesando imágenes…' : 'Arrastra imágenes o búscalas en tu equipo'}</span>
        </div>
      ) : (
        <ul className="photos__grid" aria-label="Fotografías del artículo">
          {value.map((src, i) => (
            <li key={src} className={`photos__tile${i === 0 ? ' photos__tile--cover' : ''}`}>
              {i === 0 ? (
                <>
                  <img src={src} alt="Portada" />
                  <span className="photos__badge" aria-hidden="true">Portada</span>
                </>
              ) : (
                <button type="button" className="photos__pick" disabled={busy} onClick={() => makeCover(i)}
                        aria-label={`Usar la foto ${i + 1} como portada`}>
                  <img src={src} alt="" />
                </button>
              )}
              <button type="button" className="photos__remove" disabled={busy} onClick={() => remove(i)}
                      aria-label={i === 0 ? 'Quitar la portada' : `Quitar la foto ${i + 1}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </li>
          ))}
          {room > 0 && (
            <li className="photos__tile">
              <button type="button" className="photos__add" disabled={busy} onClick={open}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>{busy ? 'Procesando…' : 'Agregar'}</span>
              </button>
            </li>
          )}
        </ul>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png" multiple hidden
             onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />

      <p className="photo__hint" aria-live="polite">{hintFor(value.length)}</p>
      {message && <p className="auth-field__error" role="alert">{message}</p>}
    </div>
  );
}
