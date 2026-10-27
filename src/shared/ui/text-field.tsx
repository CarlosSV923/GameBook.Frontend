import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "aria-invalid"
> & {
  error?: string;
  hint?: string;
  icon?: ReactNode;
  endAdornment?: ReactNode;
  id?: string;
  label: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { className, endAdornment, error, hint, icon, id, label, ...inputProps },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const description =
      [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="grid gap-2 font-ui text-sm">
        <label
          className="font-semibold leading-4 text-ink-secondary"
          htmlFor={inputId}
        >
          {label}
        </label>
        <span
          className={`relative flex min-h-11 items-center rounded-control border ${error ? "border-danger" : "border-border"} bg-paper-inset text-ink transition-[border-color,box-shadow] duration-150 focus-within:border-focus focus-within:ring-3 focus-within:ring-focus`}
        >
          {icon ? (
            <span aria-hidden="true" className="ml-3 inline-flex shrink-0">
              {icon}
            </span>
          ) : null}
          <input
            {...inputProps}
            aria-describedby={description}
            aria-invalid={error ? true : undefined}
            className={`min-h-11 w-full min-w-0 bg-transparent px-3 text-sm outline-none placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-60 ${icon ? "pl-2" : ""} ${className ?? ""}`.trim()}
            id={inputId}
            ref={ref}
          />
          {endAdornment ? (
            <span className="mr-1 inline-flex shrink-0">{endAdornment}</span>
          ) : null}
        </span>
        {hint ? (
          <span className="text-xs leading-4 text-ink-muted" id={hintId}>
            {hint}
          </span>
        ) : null}
        {error ? (
          <span className="text-xs font-medium leading-4 text-ink" id={errorId}>
            {error}
          </span>
        ) : null}
      </div>
    );
  },
);
