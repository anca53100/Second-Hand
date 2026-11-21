import { useState } from 'react';

export default function FormField({ id, label, error, as = 'input', type, children, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const Control = as;
  const errorId = `${id}-error`;
  const isPassword = type === 'password';

  const control = (
    <Control
      id={id}
      name={id}
      type={isPassword && showPassword ? 'text' : type}
      className={`auth-field__control${error ? ' is-invalid' : ''}`}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? errorId : undefined}
      {...props}
    >
      {children}
    </Control>
  );

  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-field__label">{label}</label>
      {isPassword ? (
        <div className="auth-field__password">
          {control}
          <button
            type="button"
            className="auth-field__toggle"
            aria-label="Mostrar contraseña"
            aria-pressed={showPassword}
            aria-controls={id}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      ) : control}
      {error && <p id={errorId} className="auth-field__error" role="alert">{error}</p>}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
