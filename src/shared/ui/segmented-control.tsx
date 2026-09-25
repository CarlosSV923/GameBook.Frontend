"use client";

export type SegmentedControlOption<Value extends string> = {
  label: string;
  value: Value;
};

type SegmentedControlProps<Value extends string> = {
  ariaLabel: string;
  onChange: (value: Value) => void;
  options: readonly SegmentedControlOption<Value>[];
  value: Value;
};

export function SegmentedControl<Value extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: SegmentedControlProps<Value>) {
  return (
    <div aria-label={ariaLabel} className="segmented-control" role="group">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            aria-pressed={selected}
            className="segmented-control__option"
            data-selected={selected}
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
