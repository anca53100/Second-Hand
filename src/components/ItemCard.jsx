import Chip from './Chip.jsx';

// Tarjeta de un artículo publicado. Recibe el artículo por props.
export default function ItemCard({ item }) {
  const { title, category, condition, location, image } = item;
  return (
    <article className="sh-card">
      <img className="sh-card__img" src={image} alt={title} loading="lazy"
           onError={(e) => { e.currentTarget.removeAttribute('src'); }} />
      <div className="sh-card__body">
        <Chip variant="green">{category}</Chip>
        <Chip variant="yellow">{condition}</Chip>
        <h3 className="sh-card__title">{title}</h3>
        <p className="sh-card__location mb-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" aria-hidden="true">
            <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" />
          </svg>
          {location}
        </p>
      </div>
    </article>
  );
}
