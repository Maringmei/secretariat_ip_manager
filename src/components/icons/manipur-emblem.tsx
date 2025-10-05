import type { ImgHTMLAttributes } from 'react';

export function ManipurEmblem(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img src='/images/logo.png' alt="kanglasha" {...props} />
  );
}
