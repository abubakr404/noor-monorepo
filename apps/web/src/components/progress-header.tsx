"use client";

import { useTranslations } from "next-intl";
import { Progress } from "@repo/ui/components";

interface ProgressHeaderProps {
  completed: number;
  total: number;
}

export function ProgressHeader({ completed, total }: ProgressHeaderProps) {
  const t = useTranslations("Azkar");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t("progress", { completed, total })}
        </span>
        {completed >= total && total > 0 && (
          <span className="text-gold-500 font-medium animate-checkmark">
            ✓
          </span>
        )}
      </div>
      <Progress
        value={completed}
        max={total}
        className="h-2 bg-gold-100 dark:bg-dark-elevated [&>div]:bg-gold-500"
      />
    </div>
  );
}
