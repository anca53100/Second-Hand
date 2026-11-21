import { getInitials } from '../utils/format.js';

export default function Avatar({ src, name, size = 36, ring = false }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  const cls = `avatar${ring ? ' avatar--ring' : ''}`;
  return src
    ? <img src={src} alt="" className={cls} style={style} />
    : <span className={cls} style={style} aria-hidden="true">{getInitials(name)}</span>;
}
