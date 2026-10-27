import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "ghost" | "primary" | "secondary";

type SharedProps = {
  children?: ReactNode;
  className?: string;
  loading?: boolean;
  variant?: ButtonVariant;
};

type ButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: never;
  };

type LinkButtonProps = SharedProps & {
  href: string;
  disabled?: boolean;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export type GameBookButtonProps = ButtonProps | LinkButtonProps;

const baseClasses =
  "relative inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 py-2 font-ui text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-colors motion-reduce:active:scale-100";

const variantClasses: Record<ButtonVariant, string> = {
  ghost:
    "border border-transparent bg-transparent text-ink-secondary hover:bg-paper-inset hover:text-ink",
  primary:
    "border border-transparent bg-primary-action text-primary-action-text hover:brightness-95",
  secondary:
    "border border-border bg-paper-raised text-ink hover:bg-paper-inset",
};

function classes(variant: ButtonVariant, className?: string) {
  return `${baseClasses} ${variantClasses[variant]} ${className ?? ""}`.trim();
}

function LoadingMark() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-1/2 size-3 -translate-x-1/2 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
    />
  );
}

export function Button(props: GameBookButtonProps) {
  const { children, className, loading = false, variant = "secondary" } = props;
  const buttonClasses = classes(variant, className);

  if ("href" in props && props.href !== undefined) {
    const { disabled = false, href, rel, target, onClick } = props;
    return (
      <Link
        aria-busy={loading || undefined}
        aria-disabled={disabled || undefined}
        className={`${buttonClasses}${disabled ? " pointer-events-none opacity-60" : ""}`}
        href={href}
        onClick={disabled ? (event) => event.preventDefault() : onClick}
        rel={rel}
        tabIndex={disabled ? -1 : undefined}
        target={target}
      >
        <span className={loading ? "opacity-0" : undefined}>{children}</span>
        {loading ? <LoadingMark /> : null}
      </Link>
    );
  }

  const {
    children: _children,
    className: _className,
    loading: _loading,
    variant: _variant,
    disabled = false,
    type = "button",
    ...buttonProps
  } = props;
  void _children;
  void _className;
  void _loading;
  void _variant;
  return (
    <button
      {...buttonProps}
      aria-busy={loading || undefined}
      className={buttonClasses}
      disabled={disabled || loading}
      type={type}
    >
      <span className={loading ? "opacity-0" : undefined}>{children}</span>
      {loading ? <LoadingMark /> : null}
    </button>
  );
}
