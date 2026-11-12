import React from 'react';
import {random} from 'remotion';
import {WHITE} from '../theme';

/** Bitmap glyph from string rows: '#' white, '+' light grey, '-' dark grey, '.' empty. */
export const PixelGlyph: React.FC<{
  rows: string[];
  cell: number;
  x?: number;
  y?: number;
  center?: boolean;
  color?: string;
  rounded?: boolean;
}> = ({rows, cell, x = 0, y = 0, center = true, color = WHITE, rounded = false}) => {
  const w = Math.max(...rows.map((r) => r.length)) * cell;
  const h = rows.length * cell;
  const ox = center ? x - w / 2 : x;
  const oy = center ? y - h / 2 : y;
  const fills: Record<string, string> = {'#': color, '+': '#bdbdbd', '-': '#5c5c5c'};
  return (
    <g transform={`translate(${ox} ${oy})`} shapeRendering={rounded ? undefined : 'crispEdges'}>
      {rows.flatMap((row, j) =>
        Array.from(row).map((ch, i) =>
          fills[ch] ? (
            <rect
              key={`${i}-${j}`}
              x={i * cell}
              y={j * cell}
              width={cell + (rounded ? 0 : 0.5)}
              height={cell + (rounded ? 0 : 0.5)}
              rx={rounded ? cell * 0.45 : 0}
              fill={fills[ch]}
            />
          ) : null,
        ),
      )}
    </g>
  );
};

/** Deterministic random pixel glyph (optionally mirrored like a sprite). */
export const seededGlyph = (seed: string, cols = 4, rows = 5, density = 0.5, mirror = false): string[] =>
  Array.from({length: rows}, (_, j) => {
    const half = mirror ? Math.ceil(cols / 2) : cols;
    const row = Array.from({length: half}, (_, i) => (random(`${seed}-${i}-${j}`) < density ? '#' : '.'));
    if (!mirror) return row.join('');
    const tail = row.slice(0, Math.floor(cols / 2)).reverse();
    return [...row, ...tail].join('');
  });

export const INVADER = ['##..##..##', '##########', '..##..##..', '####..####', '..##..##..'];
export const INVADER_B = ['..##..##..', '##########', '##..##..##', '..##..##..', '####..####'];
export const QUERY = ['..###.', '.#...#', '....#.', '..##..', '..#...'];
export const HOOK = ['####..', '...#..', '.####.', '.#..##', '.#....'];
export const CHECKERS: string[][] = [['+-', '-+'], ['#.', '.-'], ['-#', '+.'], ['.+', '#-'], ['+', '-'], ['#']];
