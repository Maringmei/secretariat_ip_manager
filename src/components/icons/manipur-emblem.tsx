import type { SVGProps } from 'react';

export function ManipurEmblem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      {...props}
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M50 15 L60 30 L50 45 L40 30 Z"
        fill="currentColor"
      />
      <path
        d="M50 55 L30 70 L50 85 L70 70 Z"
        fill="currentColor"
      />
      <path d="M30 35 H70" stroke="currentColor" strokeWidth="2" />
      <path d="M35 50 H65" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
