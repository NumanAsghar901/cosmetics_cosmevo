'use client';

import React from 'react';
import { getWhatsAppUrl } from '@/lib/utils';

export default function WhatsAppFloat() {
  const href = getWhatsAppUrl('Hi Cosmevo, I need help choosing a product or checking my order.');

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      id="wa-float"
      aria-label="Chat on WhatsApp"
      data-cursor="Chat"
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center z-30 shadow-soft hover:scale-110 active:scale-95 transition-transform duration-200"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.77.46 3.45 1.32 4.94L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.79 14.02c-.24.68-1.4 1.3-1.93 1.34-.5.05-1.02.24-3.4-.71-2.87-1.15-4.71-4.06-4.85-4.25-.14-.19-1.16-1.55-1.16-2.96 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2 1.11.99 2.04 1.29 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.63-.14.26.1 1.64.77 1.92.91.29.14.48.21.55.33.07.12.07.7-.17 1.38Z" />
      </svg>
    </a>
  );
}
