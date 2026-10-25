import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  "aria-label": string;
  children?: ReactNode;
  pressed?: boolean;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { children, className, pressed, type = "button", ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        aria-pressed={pressed}
        className={`inline-grid size-11 shrink-0 place-items-center rounded-control border border-transparent bg-transparent text-ink-secondary transition-[background-color,border-color,color,transform] duration-150 hover:border-border hover:bg-paper-inset hover:text-ink active:scale-[0.97] focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-colors motion-reduce:active:scale-100 ${className ?? ""}`.trim()}
        ref={ref}
        type={type}
      >
        {children}
      </button>
    );
  },
);
