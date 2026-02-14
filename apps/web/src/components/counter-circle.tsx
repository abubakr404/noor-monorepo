"use client";

interface CounterCircleProps {
  current: number;
  target: number;
  onTap: () => void;
}

/**
 * Large (200px) circular counter for the standalone tasbih page.
 * Gold stroke on background, animated progress, large count number.
 */
export function CounterCircle({
  current,
  target,
  onTap,
}: CounterCircleProps) {
  const progress = target > 0 ? Math.min(current / target, 1) : 0;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference * (1 - progress);
  const isComplete = current >= target && target > 0;

  return (
    <button
      type="button"
      onClick={onTap}
      className="relative w-56 h-56 flex items-center justify-center focus:outline-none active:scale-95 transition-transform"
    >
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 200 200"
      >
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          className="stroke-gold-200/40 dark:stroke-dark-elevated"
          strokeWidth="6"
        />
        {/* Progress arc */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          className={`transition-all duration-200 ${
            isComplete ? "stroke-gold-400" : "stroke-gold-500"
          }`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span
          className={`text-5xl font-extrabold transition-colors ${
            isComplete ? "text-gold-500" : "text-foreground"
          }`}
        >
          {current}
        </span>
        <span className="text-sm text-muted-foreground mt-1">/ {target}</span>
      </div>
    </button>
  );
}
