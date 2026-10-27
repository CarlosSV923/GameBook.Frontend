import type { Messages } from "@/shared/i18n/messages";

type IgdbAttributionProps = {
  messages: Messages;
};

export function IgdbAttribution({ messages }: IgdbAttributionProps) {
  return (
    <p className="m-0 border-t border-border-soft px-4 py-3.5 pb-[18px] text-center text-[0.6875rem] leading-[1.45] text-ink-muted min-[721px]:px-6">
      <span>{messages.catalog.attribution}</span>{" "}
      <a
        className="font-bold text-copper-strong underline underline-offset-[3px] hover:text-ink"
        href="https://www.igdb.com/"
        rel="noreferrer noopener"
        target="_blank"
      >
        {messages.catalog.attributionLink}
      </a>
    </p>
  );
}
