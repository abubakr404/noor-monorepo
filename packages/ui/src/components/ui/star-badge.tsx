import * as React from "react";
import { cn } from "../../lib/utils";

interface StarBadgeProps {
  /** The number displayed inside the star */
  count: number;
  /** Pixel size of the badge (default 32) */
  size?: number;
  className?: string;
}

/**
 * 8-pointed Islamic star (octagram) badge with a centred count number.
 * Used for zikr repeat-count indicators.
 */
function StarBadge({ count, size = 32, className }: StarBadgeProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        aria-hidden="true"
      >
        {/* 8-pointed star path */}
        <path
          d="M16 0l4.24 7.76L28 4l-3.76 8.24L32 16l-7.76 4.24L28 28l-8.24-3.76L16 32l-4.24-7.76L4 28l3.76-8.24L0 16l7.76-4.24L4 4l8.24 3.76z"
          className="fill-gold-500"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-bold text-dark-base"
        style={{ fontSize: size * 0.35 }}
      >
        {count}
      </span>
    </div>
  );
}

export { StarBadge };
export type { StarBadgeProps };
