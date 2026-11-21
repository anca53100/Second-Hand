import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import FormField from '../components/auth/FormField.jsx';
import useForm from '../hooks/useForm.js';
import { useAuth } from '../context/AuthContext.jsx';
import { localities } from '../data/localities.js';
import { required, validatePhone } from '../utils/validators.js';
import { formatMonthYear } from '../utils/format.js';

const MAX_PHOTO_BYTES = 1024 * 1024;
const ACCEPTED_PHOTO = ['image/jpeg', 'image/png'];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);

  const validate = (v) => ({
    name: required(v.name),
    phone: validatePhone(v.phone),
    location: required(v.location) && 'Selecciona tu localidad.',
  });

  const { values, errors, submitError, submitting, handleChange, handleSubmit } = useForm(
    {
      name: user.name ?? '',
      phone: user.phone ?? '',
      email: user.email ?? '',
      location: user.location ?? '',
    },
    validate,
    async (v) => {
      await updateUser({ name: v.name.trim(), phone: v.phone, location: v.location });
      setSaved(true);
    }
  );

  const onChange = (e) => { setSaved(false); handleChange(e); };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_PHOTO.includes(file.type)) { setPhotoError('Selecciona una imagen (JPG o PNG).'); return; }
    if (file.size > MAX_PHOTO_BYTES) { setPhotoError('La imagen debe pesar menos de 1 MB.'); return; }
    setPhotoError('');
    const reader = new FileReader();
    reader.onload = async () => {
      setPhotoBusy(true);
      try {
        await updateUser({ photo: reader.result });
      } catch (err) {
        setPhotoError(err.message || 'No pudimos guardar la foto. Intenta de nuevo.');
      } finally {
        setPhotoBusy(false);
      }
    };
    reader.onerror = () => setPhotoError('No pudimos leer la imagen. Prueba con otra.');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="page container-xl">
      <div className="page__head">
        <h1>Mi perfil</h1>
        <p>Tus datos de contacto son visibles para quien acepte o reciba una solicitud tuya.</p>
      </div>

      <div className="profile-grid">
        <section className="card-sh profile-summary" aria-label="Resumen del perfil">
          <Avatar src={user.photo} name={user.name} size={168} ring />
          <p className="profile-summary__name">{user.name}</p>
          <p className="profile-summary__since">Miembro desde {formatMonthYear(user.memberSince)}</p>

          <input ref={fileRef} type="file" accept="image/jpeg,image/png" hidden onChange={handlePhoto} />
          <button type="button" className="btn btn-sh-outline btn-sm w-100" disabled={photoBusy}
                  onClick={() => fileRef.current?.click()}>
            {photoBusy ? 'Guardando foto…' : 'Cambiar foto'}
          </button>
          {photoError && <p className="auth__alert" role="alert">{photoError}</p>}
        </section>

        <section className="card-sh field-light" aria-labelledby="personal-data">
          <h2 id="personal-data">Datos personales</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="field-grid">
              <FormField id="name" label="Nombre completo" autoComplete="name"
                         value={values.name} onChange={onChange} error={errors.name} />
              <FormField id="phone" label="Teléfono" type="tel" autoComplete="tel"
                         value={values.phone} onChange={onChange} error={errors.phone} />
              <FormField id="email" label="Correo electrónico" type="email" readOnly
                         value={values.email} onChange={onChange} />
              <FormField id="location" label="Ubicación" as="select"
                         value={values.location} onChange={onChange} error={errors.location}>
                <option value="">Selecciona tu localidad</option>
                {localities.map((l) => <option key={l} value={l}>{l}, Bogotá</option>)}
              </FormField>
            </div>

            {submitError && <p className="auth__alert" role="alert">{submitError}</p>}
            {saved && <p className="auth__success" role="status">Cambios guardados.</p>}

            <button type="submit" className="btn btn-sh mt-3" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        </section>

        <section className="card-sh danger profile-grid__full" aria-labelledby="logout-title">
          <h2 id="logout-title">Cerrar sesión</h2>
          <p>Tu sesión actual se cerrará y tendrás que iniciar sesión nuevamente para acceder a tu cuenta.</p>
          <button type="button" className="btn btn-danger-outline btn-sm" onClick={handleLogout}>Cerrar sesión</button>
        </section>
      </div>
    </div>
  );
}
