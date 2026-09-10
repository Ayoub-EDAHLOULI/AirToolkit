import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";

const EXAMPLES = [
  { expr: "*/15 9-17 * * 1-5", label: "Every 15 min, 9-5, weekdays" },
  { expr: "0 2 * * *", label: "Daily at 2:00 AM" },
  { expr: "0 0 1 * *", label: "First of every month" },
  { expr: "0 0 * * 0", label: "Every Sunday at midnight" },
];

interface Result {
  description: string | null;
  nextRuns: Date[];
  error: string | null;
}

function explainCron(expression: string): Result {
  if (!expression.trim()) {
    return { description: null, nextRuns: [], error: null };
  }

  try {
    const description = cronstrue.toString(expression, {
      throwExceptionOnParseError: true,
    });

    const interval = CronExpressionParser.parse(expression);
    const nextRuns: Date[] = [];
    for (let i = 0; i < 5; i++) {
      nextRuns.push(interval.next().toDate());
    }

    return { description, nextRuns, error: null };
  } catch (err) {
    return {
      description: null,
      nextRuns: [],
      error: (err as Error).message,
    };
  }
}

export default function CronExplainer() {
  const [expression, setExpression] = useState("");

  const { description, nextRuns, error } = useMemo(
    () => explainCron(expression),
    [expression],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <CalendarClock className="text-primary" size={20} />
        <h2 className="font-semibold text-text">Cron Explainer</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-xl flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subText">
              Cron Expression
            </label>
            <input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g. */15 9-17 * * 1-5"
              spellCheck={false}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-subText">Examples:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.expr}
                onClick={() => setExpression(ex.expr)}
                title={ex.label}
                className="px-2.5 py-1 rounded-lg text-xs font-mono border border-border text-subText hover:bg-inputBg transition-colors"
              >
                {ex.expr}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          {description && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-text">{description}</p>
            </div>
          )}

          {nextRuns.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-subText">
                Next 5 run times
              </span>
              <div className="rounded-lg border border-border overflow-hidden">
                {nextRuns.map((date, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 text-sm text-text border-b border-border last:border-b-0 font-mono"
                  >
                    {date.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
