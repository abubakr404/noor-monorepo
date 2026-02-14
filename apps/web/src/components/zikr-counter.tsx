"use client";

interface ZikrCounterProps {
  current: number;
  target: number;
  onTap: () => void;
}

/**
 * Circular tap counter for the zikr detail page (interactive mode).
 * Shows a gold ring progress indicator with the current count.
 */
export function ZikrCounter({ current, target, onTap }: ZikrCounterProps) {
  const progress = target > 0 ? Math.min(current / target, 1) : 0;
  const circumference = 2 * Math.PI * 80; // radius = 80
  const strokeDashoffset = circumference * (1 - progress);
  const isComplete = current >= target;

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={isComplete}
      className="relative w-48 h-48 flex items-center justify-center focus:outline-none active:scale-95 transition-transform"
    >
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 200 200"
      >
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          className="stroke-gold-200 dark:stroke-dark-elevated"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          className="stroke-gold-500 transition-all duration-200"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span
          className={`text-4xl font-extrabold ${
            isComplete ? "text-gold-500" : "text-foreground"
          }`}
          key={current} // re-mount to trigger animation
        >
          {current}
        </span>
        <span className="text-sm text-muted-foreground">/ {target}</span>
      </div>
    </button>
  );
}
