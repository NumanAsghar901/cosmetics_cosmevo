'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RevealInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in-view');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    // Give React a tiny bit of time to render the new page's DOM elements
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-mask').forEach((el) => {
        // Only observe if it hasn't already been revealed
        if (!el.classList.contains('in-view')) {
          io.observe(el);
        }
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
