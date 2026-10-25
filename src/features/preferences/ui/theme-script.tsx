const themeScript = `(() => {
  let storedTheme = null;

  try {
    storedTheme = window.localStorage.getItem("gamebook.theme");
  } catch {}

  const theme =
    storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();`;

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      id="gamebook-theme"
    />
  );
}
