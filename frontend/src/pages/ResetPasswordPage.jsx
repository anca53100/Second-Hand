import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import FormField from '../components/auth/FormField.jsx';
import useForm from '../hooks/useForm.js';
import { validatePassword } from '../utils/validators.js';
import { resetPassword } from '../services/authService.js';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const { values, errors, submitError, submitting, handleChange, handleSubmit } = useForm(
    { password: '' },
    (v) => ({ password: validatePassword(v.password) }),
    async (v) => {
      const { message } = await resetPassword({ token, password: v.password });
      navigate('/login', { replace: true, state: { notice: message } });
    }
  );

  return (
    <AuthLayout
      tagline="Recupera el acceso a tu cuenta"
      mobileTagline="Nada nuevo se fabricó para esto"
      description="Elige una contraseña nueva para volver a entrar."
      title="Nueva contraseña"
      subtitle={<>¿El enlace venció? <Link to="/recuperar-contrasena">Pide uno nuevo.</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField id="password" label="Contraseña nueva" type="password" placeholder="Mínimo 8 caracteres"
                   autoComplete="new-password" value={values.password} onChange={handleChange} error={errors.password} />

        {submitError && <p className="auth__alert" role="alert">{submitError}</p>}

        <button type="submit" className="btn auth__submit" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </AuthLayout>
  );
}
