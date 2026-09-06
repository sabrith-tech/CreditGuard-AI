export interface AgentStep {
  label: string;
  detail: string;
}

export function AgentStepper({
  steps,
  activeIndex,
}: {
  steps: AgentStep[];
  activeIndex: number; // steps before this = done, this one = active, after = pending
}) {
  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const state =
          i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
        const isLast = i === steps.length - 1;

        return (
          <li key={step.label} className="relative pl-9 pb-7 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[9px] top-5 bottom-0 w-px"
                style={{
                  background:
                    state === "done" ? "var(--verified)" : "var(--line)",
                  opacity: state === "done" ? 0.6 : 1,
                }}
              />
            )}

            <span
              className="absolute left-0 top-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border font-mono text-[10px]"
              style={{
                borderColor:
                  state === "pending" ? "var(--line)" : "var(--verified)",
                color: state === "pending" ? "var(--text-faint)" : "var(--ink)",
                backgroundColor:
                  state === "pending" ? "transparent" : "var(--verified)",
              }}
            >
              {state === "done" ? "✓" : i + 1}
            </span>

            <p
              className={`font-mono text-sm ${
                state === "pending" ? "text-text-faint" : "text-text-primary"
              } ${state === "active" ? "animate-pulse" : ""}`}
            >
              {step.label}
            </p>
            <p className="text-xs text-text-muted mt-0.5">{step.detail}</p>
          </li>
        );
      })}
    </ol>
  );
}
