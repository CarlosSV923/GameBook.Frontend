import type { Messages } from "@/shared/i18n/messages";

type IgdbAttributionProps = {
  messages: Messages;
};

export function IgdbAttribution({ messages }: IgdbAttributionProps) {
  return (
    <p className="igdb-attribution">
      <span>{messages.catalog.attribution}</span>{" "}
      <a href="https://www.igdb.com/" rel="noreferrer noopener" target="_blank">
        {messages.catalog.attributionLink}
      </a>
    </p>
  );
}
