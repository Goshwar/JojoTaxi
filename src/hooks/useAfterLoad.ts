import { useEffect, useState } from 'react';

/**
 * Returns false until the window `load` event has fired, then true.
 *
 * Used to hold back images that sit inside a fade carousel. Swiper's fade
 * effect stacks every slide on top of each other inside the viewport, so the
 * browser treats them all as visible and `loading="lazy"` never defers
 * anything — all slides download at once, competing with the image the visitor
 * is actually looking at. Mounting the off-screen slides after `load` moves
 * them off the critical path without changing what the carousel does: the
 * first autoplay transition is seconds away, well after they have arrived.
 *
 * Returns true immediately when the document has already finished loading, so
 * a component mounted later (a client-side route change) is not left waiting
 * for an event that has been and gone.
 */
export function useAfterLoad(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (document.readyState === 'complete') {
      setLoaded(true);
      return;
    }
    const onLoad = () => setLoaded(true);
    window.addEventListener('load', onLoad, { once: true });
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return loaded;
}
