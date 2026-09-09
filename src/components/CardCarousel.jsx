import { Children, useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Native scrolling keeps touch, trackpad and keyboard navigation on the same track.
export function CardCarousel({ children, label = 'Parcourir les cartes' }) {
  const track = useRef(null);
  const id = useId();
  const [position, setPosition] = useState({ first: true, last: true });
  const count = Children.count(children);
  useEffect(() => {
    const node = track.current;
    const update = () => setPosition({ first: node.scrollLeft < 2, last: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2 });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    node.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); node.removeEventListener('scroll', update); };
  }, [count]);
  const move = (direction) => {
    const node = track.current;
    node.scrollBy({ left: direction * (node.clientWidth + 24), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <div className="card-carousel" role="region" aria-roledescription="carrousel" aria-label={label}>
    <div className="carousel-controls collection-controls">
      <button type="button" aria-label={`${label} : précédentes`} aria-controls={id} disabled={position.first} onClick={() => move(-1)}><ArrowLeft size={20}/></button>
      <button type="button" aria-label={`${label} : suivantes`} aria-controls={id} disabled={position.last} onClick={() => move(1)}><ArrowRight size={20}/></button>
    </div>
    <div className="card-carousel-track" id={id} ref={track} tabIndex={0} aria-label={label}>{children}</div>
  </div>;
}
