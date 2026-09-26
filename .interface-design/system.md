# GameBook — Sistema visual

Estado: implementado en GB-006.03 y ampliado en GB-006.05 a partir de la dirección aprobada en GB-006.01.

## Dirección

GameBook se expresa como un archivo de juegos / guía de campo: editorial, técnico y tranquilo. La firma visual es la tira de índice inspirada en un lomo de libro; las futuras fichas, catálogos y colecciones deben conservar esa lectura de archivo. La navegación, el estado vacío del catálogo y los controles de preferencias ya usan esta lectura; las tarjetas funcionales llegarán con las tareas de catálogo y favoritos.

## Tokens

- `--paper`: canvas principal de papel marfil en claro y carbón azulado en oscuro.
- `--paper-raised`: superficie cálida elevada para fichas y paneles.
- `--paper-inset`: superficie ligeramente más profunda para controles.
- `--ink`, `--ink-secondary`, `--ink-muted`: cuatro niveles de lectura mediante color y peso.
- `--slate`: estructura y selección sin convertir la interfaz en un dashboard.
- `--copper`: único acento de foco y producto; `--copper-strong` refuerza etiquetas pequeñas.
- `--moss`, `--warning`, `--danger`: estados semánticos reservados para futuros mensajes.

## Tema y preferencias

- El tema inicial resuelve `prefers-color-scheme` antes del primer render mediante `ThemeScript`.
- Una elección manual de claro u oscuro se guarda en `localStorage` con la clave `gamebook.theme` y prevalece sobre el sistema.
- El idioma comienza siempre en inglés, independiente del navegador.
- Una elección entre `en` y `es` se guarda con `gamebook.language`; los textos propios consumen el catálogo tipado en `src/shared/i18n/messages.ts`.
- Las preferencias se aplican en `PreferencesProvider`, funcionan sin cuenta y actualizan `document.documentElement` sin cerrar sesión ni depender de APIs externas.

## Tipografía, densidad y profundidad

- Titulares editoriales: serif de sistema (`Georgia`) con escala fluida y tracking óptico negativo.
- Controles y metadatos: sans de sistema, con peso y contraste para diferenciar valor, etiqueta y apoyo.
- Base de espaciado: 4 px; grupos principales en múltiplos de 8 px.
- Controles: mínimo visual de 44 px y foco visible en cobre.
- Profundidad: cambios de superficie y bordes silenciosos; sombra de elevación muy tenue en superficies claras y solo anillo en oscuro.
- Radios: 6 px para controles y 12 px para paneles; no usar píldoras como lenguaje global.

## Patrones a conservar

- Preferencias agrupadas con `fieldset`/`legend` y botones nativos con `aria-pressed`.
- `SegmentedControl` — grupo accesible reutilizable para elecciones mutuamente excluyentes; botones de 44 px mínimos, `aria-pressed` y tokens `paper-inset`/`slate`.
- `CatalogNavbar` — barra superior de 76 px en escritorio, marca editorial con tira de cobre, navegación principal centrada y acciones de cuenta a la derecha; en móvil se apila en dos filas.
- `IndexStrip` — franja vertical de archivo con puntuación, año y plataformas; acompaña estados y futuras fichas sin depender de hover.
- `CatalogState` — patrón común para `loading`, `empty` y `error`, con mensaje traducido, tira de índice y acción de reintento cuando corresponde.
- Estados seleccionados comunicados por tono, texto y `aria-pressed`, no solo por color.
- Respetar `prefers-reduced-motion`; animar solo color, opacidad o transformación breve.
- Aplicar tokens semánticos en vez de hexágonos repetidos al construir componentes posteriores.
