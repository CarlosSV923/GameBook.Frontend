"use client";

export type SegmentedControlOption<Value extends string> = {
  label: string;
  value: Value;
};

type SegmentedControlProps<Value extends string> = {
  ariaLabel: string;
  disabled?: boolean;
  onChange: (value: Value) => void;
  options: readonly SegmentedControlOption<Value>[];
  value: Value;
};

export function SegmentedControl<Value extends string>({
  ariaLabel,
  disabled = false,
  onChange,
  options,
  value,
}: SegmentedControlProps<Value>) {
  return (
    <div
      aria-label={ariaLabel}
      className="inline-flex min-h-11 items-center gap-1 rounded-panel border border-border bg-paper-raised p-1"
      role="group"
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            aria-pressed={selected}
            className={`min-h-11 rounded-control px-3 font-ui text-sm font-medium transition-[background-color,color,transform] duration-150 hover:bg-paper-inset active:scale-[0.97] focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-colors motion-reduce:active:scale-100 ${selected ? "bg-paper-inset text-ink" : "bg-transparent text-ink-secondary"}`}
            data-selected={selected}
            disabled={disabled}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
