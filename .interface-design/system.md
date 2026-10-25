# GameBook — Sistema visual

Estado: sistema implementable para **GB-017.02–.08**, basado en la identidad originada en GB-006 y la dirección A «Archive Refined», aprobada el 2026-10-24. La referencia es una guía de campo: papel, tinta, lomos de archivo y una tira de índice que permite escanear una colección. Mantener esta jerarquía y los contratos de comportamiento del MVP al migrar las vistas.

## Tokens y temas

Declara colores como tokens semánticos de Tailwind CSS 4 bajo `@theme`; cada token `--color-*` genera una utilidad del mismo nombre (`bg-paper`, `text-ink`, `border-ink/10`, etc.). Los valores del tema oscuro parten de los artboards aprobados. Los claros conservan la paleta de `globals.css` cuando cumple contraste; `ink-muted` se oscurece de `#7A858A` a `#596368`, porque el valor vigente no llega a AA sobre superficies claras. El `#8F887D` usado para algunos metadatos del artboard oscuro tampoco alcanza 4.5:1 sobre `paper-raised` (4.23:1), así que se usa `#B9B2A6` para todo texto secundario y muted.

| Token Tailwind          | Claro              | Oscuro             | Uso                                                                                                                                                                |
| ----------------------- | ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--color-paper`         | `#F3EFE6`          | `#1B2027`          | Canvas de papel marfil / carbón azulado.                                                                                                                           |
| `--color-paper-raised`  | `#FBF8F1`          | `#222831`          | Fichas, paneles, popovers y modales.                                                                                                                               |
| `--color-paper-inset`   | `#E8E1D4`          | `#161A20`          | Campos, zonas de entrada y superficies hundidas.                                                                                                                   |
| `--color-ink`           | `#252B2E`          | `#ECE6DA`          | Texto principal y títulos sobre las superficies del sistema.                                                                                                       |
| `--color-ink-secondary` | `#536067`          | `#B9B2A6`          | Descripciones, valores secundarios y etiquetas.                                                                                                                    |
| `--color-ink-muted`     | `#596368`          | `#B9B2A6`          | Metadatos y texto de apoyo; contraste AA incluso en `paper-inset` (claro) y `paper-raised` (oscuro). La jerarquía secundaria se obtiene también con tamaño y peso. |
| `--color-slate`         | `#344B59`          | `#2C333D`          | Estructura, selección y estado activo; no es el fondo de la acción primaria.                                                                                       |
| `--color-copper`        | `#A85F3B`          | `#D9875A`          | Acento de marca, rellenos no textuales y foco; el uso como acción primaria se especifica debajo.                                                                   |
| `--color-copper-strong` | `#874523`          | `#F2B48A`          | Cobre para texto destacado, puntuación y enlaces, con contraste AA sobre superficies del tema.                                                                     |
| `--color-moss`          | `#55705A`          | `#8EAE91`          | Indicador semántico de éxito. Acompañarlo con texto `ink`, nunca comunicar éxito solo con color.                                                                   |
| `--color-warning`       | `#9B7027`          | `#D0A457`          | Indicador semántico de advertencia. Acompañarlo con texto `ink`.                                                                                                   |
| `--color-danger`        | `#A84E49`          | `#DC8279`          | Indicador semántico destructivo/error. Acompañarlo con texto `ink`.                                                                                                |
| `--color-scrim`         | `rgb(0 0 0 / 64%)` | `rgb(0 0 0 / 64%)` | Fondo oscuro constante detrás del modal en ambos temas.                                                                                                            |

`paper`, `paper-raised` y `paper-inset` forman la escala de superficie. Texto de estado, error o éxito permanece en `ink`/`ink-secondary` sobre `paper-raised`; moss, warning y danger se usan como acento de borde, icono o marcador, no como texto pequeño. Los bordes estándar son `rgb(37 43 46 / 16%)` en claro y `rgb(236 230 218 / 12%)` en oscuro; los separadores suaves usan 9 % y 7 % respectivamente. Foco: `copper` (`#A85F3B`) en claro y `#E0A078` en oscuro, con anillo de 3 px y separación de 2–3 px; contraste no textual ≥ 3:1 sobre todas las superficies (claro: 4.19 `paper`, 4.54 `paper-raised`, 3.70 `paper-inset`; oscuro: 7.38 sobre `paper`). El `#C6794E` heredado no se usa para foco porque solo alcanza 2.93:1 sobre `paper`.

### Contraste WCAG AA

Los pares de texto normal se comprueban con la fórmula WCAG 2.x de luminancia relativa sRGB: normalización de canales, linealización por tramos y `(L más claro + 0.05) / (L más oscuro + 0.05)`. Se informa el peor resultado entre las superficies sobre las que se usa cada rol. El requisito es 4.5:1 para texto normal.

| Par medido                                                                                                   |       Claro |      Oscuro |
| ------------------------------------------------------------------------------------------------------------ | ----------: | ----------: |
| Texto primario `ink` sobre `paper` (también sobre `paper-raised`)                                            | **12.50:1** | **13.18:1** |
| Texto `ink-muted` sobre la superficie textual más exigente: `paper-inset` / `paper-raised`                   |  **4.74:1** |  **7.05:1** |
| Texto del botón primario sobre su fondo cobre: `paper-raised` sobre `copper-strong` / `paper` sobre `copper` |  **6.81:1** |  **5.90:1** |

Por tanto, el texto del botón primario cumple AA en los dos temas. No rebajar estos pares con opacidad en estados hover, seleccionados o deshabilitados; los estados deshabilitados pueden reducir contraste únicamente cuando no sean necesarios para entender contenido activo, y deben comunicar su estado también por comportamiento/atributo.

## Tipografía

Carga con `next/font` en la composición raíz; no usar Google Fonts remotas en runtime. Crear variables CSS estables y exponerlas a Tailwind como `--font-display`, `--font-ui` y `--font-data` (`font-display`, `font-ui`, `font-data`). Mantener fallbacks locales.

| Rol                   | Familia y pesos             | Tamaño / interlínea                        | Aplicación                                                    |
| --------------------- | --------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| Display               | Newsreader 400, 600         | 64/65 px escritorio; 36/38 px móvil        | Hero; tracking `-0.02em` en escritorio.                       |
| Encabezado de sección | Newsreader 600              | 24/30 px                                   | «Top rated of all time», favoritos y secciones.               |
| Título de ficha       | IBM Plex Sans 600           | 15/20 px                                   | Tarjeta; hasta dos líneas sin cortar nombres con significado. |
| Título de detalle     | Newsreader 400, 600         | 36/40 px adaptable                         | Título principal del modal.                                   |
| Texto de interfaz     | IBM Plex Sans 400, 500, 600 | 14/20 px base; 15/21 y 16/24 para lectura  | Formularios, botones y descripciones.                         |
| Etiqueta              | IBM Plex Sans 600           | 12/16 px                                   | Campos y títulos de metadatos.                                |
| Número de archivo     | IBM Plex Mono 500           | 11–12/16 px; 14/20 px si es dato destacado | Posición, puntuación 0–100, año y valores tabulares.          |

Usar cifras tabulares para números variables. Titulares con `text-wrap: balance`; textos de lectura con `text-wrap: pretty`. No reducir el texto de controles por debajo de 12 px.

## Espaciado, radios, bordes y elevación

- **Base:** 4 px (`--spacing: 0.25rem`). Escala de implementación: 1 = 4, 2 = 8, 3 = 12, 4 = 16, 5 = 20, 6 = 24, 8 = 32, 10 = 40, 12 = 48, 16 = 64 px. Usar múltiplos; agrupar controles próximos y reservar 24–48 px entre secciones.
- **Radios Tailwind:** `--radius-control: 6px`, `--radius-card: 10px`, `--radius-panel: 12px`, `--radius-modal: 16px`. Las tarjetas siguen el artboard con 10 px; controles compactos usan 6 px. Aplicar radios concéntricos cuando una superficie contiene otra.
- **Bordes:** 1 px, silenciosos. Preferir cambios de superficie y espacio; usar borde para separar fichas, inputs, modal y foco. Evitar contornos decorativos gruesos.
- **Elevación:** `--shadow-raised` claro = `0 0 0 1px rgb(37 43 46 / 6%), 0 1px 2px -1px rgb(37 43 46 / 6%), 0 2px 4px rgb(37 43 46 / 4%)`; oscuro = `0 0 0 1px rgb(236 230 218 / 9%)`. La elevación clara acompaña superficies; en oscuro basta el borde/anillo.
- **Movimiento:** transiciones de 120–200 ms para controles y popovers; modales 200–250 ms; animar `opacity` y `transform`, no `transition: all`. Respetar `prefers-reduced-motion` y quitar desplazamiento/escala cuando está activo.

## Composición y responsive

- **Contenedor principal:** máximo 1280 px; en escritorio, padding lateral de 40 px (contenido máximo resultante 1200 px); en móvil, 16 px. Centrado con márgenes automáticos.
- **Cabecera:** una fila en escritorio, altura aproximada 72–76 px, con marca, navegación, preferencias y acciones de cuenta. En móvil, una fila de 68–72 px con marca, tema y menú de 44 × 44 px; el menú agrupa navegación y cuenta. No crear una fila separada para navegación o acciones.
- **Hero:** una introducción de una fila/columnas equilibradas, Newsreader 64 px en escritorio. Su bloque no supera aproximadamente 300 px (un tercio de 900 px); debe dejar visible el inicio del filtro o ranking en el primer viewport. En móvil: padding superior 24 px y titular de 36 px.
- **Filtros en escritorio:** una sola fila sticky bajo la cabecera, controles de al menos 44 px, superficie `paper-raised`, sin encabezado «Filters» duplicado. Campo de búsqueda amplio, plataforma y años más compactos y acción «Apply filters» junto a ellos. Anclar la posición sticky de acuerdo con la altura real de la cabecera.
- **Filtros en móvil:** búsqueda visible junto al botón «Filters» de 44 px; este abre una hoja/panel con filtros combinables, sugerencias y acción para aplicar/limpiar. El panel se puede cerrar con Escape, conserva foco y no oculta la búsqueda principal.
- **Catálogo escritorio:** título de ranking y atribución IGDB visibles; grid autoajustable con fichas de al menos 280 px y separación de 20 px (tres o cuatro columnas según espacio). Tarjeta horizontal con tira lateral fija, portada integrada y bloque de texto/acción.
- **Catálogo móvil:** una columna con fichas horizontales y separación de 12 px. Tira lateral de 52 px, imagen de 72 px, bloque de título y metadatos flexible y acción de 44 px. La tira no depende de hover.
- **Detalle:** modal máximo 820 px, altura máxima del viewport menos 48 px, contenido desplazable y padding exterior de 24 px (12 px en móvil). En móvil, encabezado apilable con portada, título y cierre sin desbordar.

## Componentes: anatomía y estados

Todas las acciones usan elementos HTML semánticos y los primitives existentes; estado visual no reemplaza comportamiento, etiquetas ni anuncios accesibles.

### Button

- **Anatomía:** `<button>` o `<a>` según la acción; altura mínima 44 px, padding horizontal 16–20 px, texto IBM Plex Sans 14/20 px y radio 6 px. No convertir enlaces de navegación en botones.
- **Primary:** fondo `copper-strong` + texto `paper-raised` en claro; fondo `copper` + texto `paper` en oscuro. Es el único botón de acción más prominente del grupo; nunca usar `slate` como relleno principal. Debe conservar los contrastes medidos arriba.
- **Secondary:** fondo transparente o `paper-raised`, borde suave y texto `ink`; puede usar `paper-inset` en selección. No compite cromáticamente con Primary.
- **Ghost:** sin relleno, texto `ink-secondary`, hover sobre `paper-inset`; reservado para limpiar, cancelar o navegación secundaria.
- **Estados:** hover cambia sutilmente tono/borde; pressed escala hasta 0.97; foco con anillo 3 px; loading conserva ancho y nombre accesible, expone `aria-busy`; disabled tiene atributo `disabled` y no parece una acción activa.

### IconButton

- **Anatomía:** botón cuadrado de 44 × 44 px con SVG de 18–20 px, nombre accesible localizado y sin texto visible cuando el espacio lo exige. No depender de tooltip para el nombre.
- **Estados:** hover/pressed/focus/disabled definidos como Button. Favorito guardado comunica estado por `aria-pressed` o nombre actualizado, forma de icono y color; no solo color.

### TextField y combobox con sugerencias

- **Anatomía:** label persistente, control de 44 px, icono opcional, valor/placeholder, ayuda o error bajo el campo. El input usa `paper-inset`, borde suave y `ink`; el placeholder nunca sustituye a la etiqueta.
- **Combobox:** conservar texto de consulta y sugerencias existentes por nombre/plataforma. Usar patrón ARIA combobox/listbox/option con `aria-expanded`, `aria-controls`, `aria-activedescendant`; flechas recorren, Enter selecciona y Escape cierra. El clic en una opción no pierde la selección por blur. Las sugerencias quedan ligadas al campo y no cubren su etiqueta.
- **Estados:** default, hover, foco, activo, inválido con texto asociado y `aria-describedby`, disabled y loading de sugerencias. No comunicar error solo con color.

### SegmentedControl

- **Anatomía:** grupo con nombre accesible y botones mutuamente excluyentes de al menos 44 px. Cada botón expone `aria-pressed`; el seleccionado usa fondo `slate`/`paper-inset` según tema y conserva texto AA.
- **Estados:** no seleccionado, seleccionado, hover, foco visible y disabled. El estado se expresa por atributo más superficie, no solo por color.

### IndexStrip

- **Anatomía común:** franja inspirada en pestaña/lomo de archivo con rango/posición, etiqueta explícita de puntuación `0–100`, año y plataformas; metadatos faltantes se representan como dato no disponible, nunca inventado. Cifras tabulares; nombre accesible localizado. Se mantiene visible en catálogo, favoritos, detalle y estados de catálogo.
- **Tarjeta escritorio:** ancho 64 px; fondo `paper-inset`; rango mono 12 px, puntuación protagonista Newsreader 28 px, año mono 12 px y plataformas en lectura vertical compacta con etiqueta accesible.
- **Tarjeta móvil:** ancho 52 px; rango mono 11 px y puntuación Newsreader 22 px. El año y las plataformas aparecen también junto al título de la ficha en horizontal, para evitar texto girado ilegible.
- **Detalle:** variante horizontal/expandida con posición, puntuación, año y plataformas en bloques de ficha técnica, sin barra vertical estrecha.
- **Estados:** valores disponibles, parciales y ausentes; carga usa marcadores/skeleton con las mismas proporciones. No inferir ranking cuando no se provee.

### GameCard

- **Anatomía:** elemento de lista semántico; ficha horizontal de 10 px de radio; IndexStrip lateral, portada 4:3 en escritorio o panel de 72 px en móvil, título, año/plataformas, control de acción y foco que cubre el disparador de detalle. La imagen tiene fallback de archivo y texto alternativo adecuado.
- **Variante catálogo:** abre detalle al activar el área de título/portada; acción de favorito independiente y con nombre que incluye el juego. Evitar botones anidados dentro de un botón.
- **Variante favoritos:** conserva la misma estructura y tira; la acción primaria de la ficha es eliminar, con confirmación contextual. Puede abrir el mismo detalle.
- **Estados:** default, hover discreto, focus-visible, loading/skeleton, imagen ausente, guardado, no guardado, mutation pending, duplicado y error. Mantener dimensiones durante carga y anuncios de resultado asociados a la acción.

### DetailModal

- **Anatomía:** diálogo modal etiquetado por el título; scrim `scrim` oscuro en ambos temas, panel `paper-raised`, cierre de 44 px, portada, título y puntuación en primer plano, IndexStrip en escala de detalle, descripción/géneros/desarrolladores/fecha como ficha técnica y atribución IGDB visible.
- **Comportamiento:** `role="dialog"`, `aria-modal="true"`, foco inicial razonable, trampa de foco, Escape/cierre explícito, retorno de foco al disparador y bloqueo de scroll de fondo. Scrim no es una superficie blanca.
- **Estados:** detalle cargando, parcial o no disponible; imagen ausente; error; acción pendiente y avisos. Los datos faltantes no generan campos inventados.

### Contextuales de favoritos y confirmación

- **Popover anónimo (GB-017.08):** junto a la acción, título/copy «Para guardar en favoritos debes:» y enlaces «Iniciar sesión» / «Crear cuenta»; EN equivalente “To save to favorites, you need to:” / “Sign in” / “Create account”. Mismo copy en tarjeta y modal. Botón disparador expone `aria-expanded` y `aria-controls`; panel con id estable, foco gestionado, Escape y clic fuera; activar guardar sin sesión nunca llama al servicio. Los enlaces sí llevan a sus rutas.
- **Confirmación de guardado autenticado (GB-017.08):** elemento contextual junto al mismo botón; explica el juego y ofrece confirmar/cancelar. Solo Confirmar dispara la mutación. Reutilizar lenguaje y comportamiento del patrón de eliminación de `mvp.md` §6. Focus return al botón al cerrar.
- **Estados de mutación:** pending impide envíos repetidos; éxito, duplicado y error tienen copy traducido y anunciado (`role="status"` o `role="alert"` según urgencia). No volver a intentar automáticamente la mutación.

### Estados de catálogo y avisos

- **Loading:** estado anunciado como polite; conserva la silueta de IndexStrip/tarjeta y presenta skeleton estable. Movimiento breve o ninguno con reducción de movimiento.
- **Empty / sin resultados:** mensaje específico para colección vacía o filtros sin coincidencia, con lenguaje de archivo y una acción existente de recuperación cuando aplique.
- **Error:** mensaje directo y opción de reintento donde ya exista; rol alert para error que requiere atención. La tira/marker mantiene continuidad visual.
- **Fin de resultados:** estado terminal discreto después del último elemento; detener nuevas solicitudes y no mostrar spinner persistente.
- **Warm-up alert:** aviso de disponibilidad de servicios con texto entendible, indicador warning, descarte solo según comportamiento vigente y foco/lectura accesible.
- **Avisos:** éxito, duplicado y error con texto, icono/marker semántico y anuncio; no solo toast de color. Mantener copy EN/ES.

## Accesibilidad e interacción

- Contraste de texto normal mínimo 4.5:1 y foco/controles distinguibles; usar los pares y valores de la sección de tokens. La información no depende solo del color, hover ni movimiento.
- Área interactiva de al menos 44 × 44 px, incluido menú, cierre, acciones de ficha y objetivos táctiles; si el icono visible es menor, ampliar el botón sin solapar otros controles.
- Orden de teclado sigue el orden de lectura; todos los controles tienen etiqueta/nombre accesible. Enter/Space activa botones; flechas y Escape cumplen los patrones de combobox, menú, modal y popover. Modal atrapa/restaura foco; popover cierra sin perder el contexto.
- Asociar labels, descripciones y errores con campos; usar `aria-live`/status para carga y mutaciones de forma no repetitiva. Mantener teclado visible con `:focus-visible`.
- Respetar `prefers-reduced-motion`; preservar cambios necesarios de estado sin desplazamiento, escala o pulso animado.
- Aplicar idioma EN/ES a toda etiqueta, estado, confirmación, texto accesible y formato visible; conservar nombres y contenido de IGDB sin traducir.

## Mapeo de componentes a subtareas

| Componente o entrega                                                                                                    | Subtarea  |
| ----------------------------------------------------------------------------------------------------------------------- | --------- |
| Tokens Tailwind `@theme`, temas, `next/font`, Button, IconButton, TextField/combobox, SegmentedControl, IndexStrip base | GB-017.02 |
| Cabecera de una fila, hero compacto, barra sticky, búsqueda visible y panel móvil de filtros                            | GB-017.03 |
| GameCard de catálogo/favoritos, escala de IndexStrip, grid desktop y filas horizontales móviles                         | GB-017.04 |
| DetailModal, scrim, ficha técnica, estados de detalle y confirmaciones existentes                                       | GB-017.05 |
| Login, registro, perfil, estados de cuenta, loading/empty/error, avisos y warm-up alert                                 | GB-017.06 |
| Popover anónimo, confirmación contextual de guardado y copy EN/ES; confirmación de eliminación conservada               | GB-017.08 |
| Retirada de CSS heredado, revisión visual/contraste/estados y capturas finales                                          | GB-017.07 |

## Patrones compartidos que se conservan

- Preferencias de tema e idioma persistidas y aplicadas antes del primer render.
- `SegmentedControl` con grupo accesible y `aria-pressed`; `IndexStrip` y `CatalogState` como vocabulario de archivo reutilizable.
- Sugerencias seleccionables con ratón o teclado, filtros combinados, resultados por desplazamiento infinito, atribución IGDB y textos de proveedor sin traducir.
- Mensajes de carga, vacío, error y reintento ya presentes; foco visible, objetivos táctiles de 44 px y variantes claro/oscuro.
