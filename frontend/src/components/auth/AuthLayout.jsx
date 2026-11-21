import { Link } from 'react-router-dom';
import AuthBrand from './AuthBrand.jsx';

export default function AuthLayout({ tagline, mobileTagline, description, title, subtitle, mobileNote, children }) {
  return (
    <div className="auth">
      <Link to="/" className="auth__back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        Volver al inicio
      </Link>

      <aside className="auth__brand-panel">
        <AuthBrand tagline={tagline} mobileTagline={mobileTagline} description={description} />
      </aside>

      <main className="auth__form-panel">
        <div className="auth__form-wrap">
          <h1 className="auth__title">{title}</h1>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
          {mobileNote && <p className="auth__mobile-note d-md-none">{mobileNote}</p>}
        </div>
      </main>
    </div>
  );
}
