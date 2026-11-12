import React from 'react';
import {AbsoluteFill} from 'remotion';

/** Full-frame 1080 SVG layer — icons and texture panels are SVG <g> elements. */
export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={1080} height={1080} viewBox="0 0 1080 1080" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

/** Absolutely positioned HTML block. anchor: c = centre, l = left-middle, tl = top-left. */
export const Abs: React.FC<{
  x: number;
  y: number;
  anchor?: 'c' | 'l' | 'tl' | 'r';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, anchor = 'c', children, style}) => {
  const tr = {c: 'translate(-50%,-50%)', l: 'translate(0,-50%)', tl: 'none', r: 'translate(-100%,-50%)'}[anchor];
  return <div style={{position: 'absolute', left: x, top: y, transform: tr, ...style}}>{children}</div>;
};

/** Black shot background. */
export const Shot: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{children}</AbsoluteFill>
);
