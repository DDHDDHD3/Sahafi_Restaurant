import React from 'react';

const paths = {
  grid: (
    <>
      <rect x="3" y="3" width="7.5" height="8.5" rx="2.2" />
      <rect x="13.5" y="3" width="7.5" height="5" rx="2.2" />
      <rect x="13.5" y="10.5" width="7.5" height="10.5" rx="2.2" />
      <rect x="3" y="14" width="7.5" height="7" rx="2.2" />
    </>
  ),
  book: (
    <>
      <path d="M5 19V5.5A2.5 2.5 0 0 1 7.5 3H18a1 1 0 0 1 1 1v15.5" />
      <path d="M7.5 21H19" />
      <path d="M5 19a2 2 0 0 0 2 2" />
      <path d="M9 8h6" />
    </>
  ),
  people: (
    <>
      <path d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.4A3.4 3.4 0 0 0 3 18.4V20" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M21 20v-1.6a3.4 3.4 0 0 0-2.6-3.3" />
      <path d="M15.5 4.2a3.5 3.5 0 0 1 0 6.6" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 17v-3" />
      <path d="M12 17v-6" />
      <path d="M15 17v-2" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.1 14.5a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-2.72 1.13V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.72-1.13l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.9 14.5H4.8a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 6 8.78l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 11.5 4.9V4.8a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.72 1.13l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0 1.13 2.72h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.08.92z" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
      <path d="M2.5 10h19" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.6 3.9a2.1 2.1 0 0 1 3 3L7.5 19l-4 1 1-4z" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="M6.5 7l.9 12a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9l.9-12" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 2.8 19.5a1.2 1.2 0 0 0 1 1.8h16.4a1.2 1.2 0 0 0 1-1.8z" />
      <path d="M12 9.5v4.2" />
      <path d="M12 17.5h.01" />
    </>
  ),
  up: (
    <>
      <path d="M3.5 16.5 9 11l4 4 7.5-7.5" />
      <path d="M15 7.5h5.5V13" />
    </>
  ),
  print: (
    <>
      <path d="M6.5 9V3.5h11V9" />
      <rect x="3.5" y="9" width="17" height="7.5" rx="2" />
      <path d="M6.5 14h11v6.5h-11z" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3.5" width="18" height="17" rx="3.5" />
      <circle cx="8.8" cy="9.3" r="1.9" />
      <path d="m3.6 17.5 4.6-4.3a2 2 0 0 1 2.7 0l6.4 6" />
    </>
  ),
  back: <path d="M15 5.5 8.5 12l6.5 6.5" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  chev: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="3.5" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  )
};

export const Icon = ({ name, size = 18, sw = 1.9, className = '' }) => {
  const content = paths[name];
  if (!content) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {content}
    </svg>
  );
};

export default Icon;
