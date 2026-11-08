import React, { memo } from 'react';

export type PixelPalette = Record<string, string | null>;

interface PixelIconProps {
  /** Rows of equal length; each character is a palette key. */
  grid: readonly string[];
  palette: PixelPalette;
  /** Rendered size in px (multiples of the grid size stay crisp). */
  size?: number;
  className?: string;
}

/** Renders pixel art as crisp SVG rects. Decorative: hidden from screen readers. */
export const PixelIcon: React.FC<PixelIconProps> = memo(
  ({ grid, palette, size = 32, className }) => {
    const width = grid[0]?.length ?? 0;
    const height = grid.length;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
        width={size}
        height={(size * height) / width}
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        {grid.flatMap((row, y) =>
          [...row].map((key, x) => {
            const fill = palette[key];
            return fill ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={fill}
              />
            ) : null;
          })
        )}
      </svg>
    );
  }
);

PixelIcon.displayName = 'PixelIcon';
