import logo from '../assets/logo-white-horizontal.svg';

export default function Footer() {
  return (
    <footer className="sh-footer">
      <div className="container">
        <img src={logo} alt="Second Hand" className="sh-footer__logo" />
        <div className="sh-footer__copy">© 2026 Second Hand. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
}
