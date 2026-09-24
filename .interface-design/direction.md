# GameBook — Dirección de interfaz

Estado: propuesta para GB-006.01; requiere aprobación del autor antes de convertirla en el sistema visual implementable.

## Intento

GameBook debe sentirse como un archivo curado de videojuegos para una persona que quiere descubrir, comparar y conservar juegos relevantes. La experiencia está dirigida a visitantes que llegan sin contexto y a personas reclutadoras que deben entender la solución rápidamente: primero debe comunicar criterio y claridad; después, profundidad de catálogo.

La acción principal de la vista pública es explorar una selección de juegos y abrir una ficha. La acción principal de una persona autenticada es volver a su colección sin perder el mismo lenguaje de catálogo. El tono será editorial, técnico y tranquilo: una guía de campo bien impresa, no una sala arcade ni un panel administrativo.

## Exploración del dominio

### Dominio

- archivo y estantería
- ficha o monografía de un juego
- índice de plataformas
- cronología de lanzamientos
- puntuación editorial y consenso
- colección personal
- búsqueda y curaduría

### Mundo de color

La referencia física es una biblioteca de consulta contemporánea al final de la tarde: papel marfil, tinta grafito, carbón azuloso, lomos azul pizarra, cobre envejecido para las marcas importantes, verde musgo en estados de confirmación y blanco cálido en superficies elevadas. El color debe parecer material del archivo, no una capa decorativa aplicada encima.

### Firma visual

La firma de GameBook será la **tira de índice**: una franja estrecha inspirada en el lomo y las pestañas de un libro que acompaña cada ficha. En ella se concentran la puntuación, el año y las plataformas mediante una jerarquía vertical breve. La misma tira aparece, con distinta escala, en la selección pública, los resultados filtrados, la vista de detalle y la colección personal. Así la identidad visual también ayuda a escanear información.

## Dirección recomendada: «archivo de juegos / guía de campo»

### Composición

- La vista pública tendrá una barra superior ligera, una introducción breve y una selección destacada como foco principal.
- Debajo, los resultados se organizarán como una estantería editorial: piezas con proporciones relacionadas, pero no una cuadrícula de tarjetas idénticas.
- El bloque de filtros se leerá como un índice de consulta y permanecerá cerca del catálogo, no escondido en una sidebar permanente.
- La vista de detalle pondrá la portada, el título y la puntuación en primer plano; los metadatos se ordenarán como una ficha técnica secundaria.
- La colección autenticada conservará el mismo patrón de archivo y cambiará el verbo principal a guardar, consultar o eliminar.

### Jerarquía de vistas

| Vista | Foco | Segundo nivel | Elementos de apoyo |
| --- | --- | --- | --- |
| Catálogo público | Juego destacado y llamada a explorar | Resultados ordenados por `total_rating` | filtros, plataformas, año, carga adicional |
| Detalle | Identidad del juego: portada, título y puntuación | fecha, plataformas y descripción | atribución, sincronización, volver |
| Colección | Lista propia de favoritos | filtros y sugerencias | eliminar, estados vacío/error |
| Acceso | Acción única del formulario | explicación breve de la sesión | cambio entre registro e inicio de sesión |

La composición desktop usará una columna de lectura dominante y una columna auxiliar estrecha para metadatos. En móvil se apilará el contenido en el mismo orden de importancia; la tira de índice seguirá visible y no dependerá de hover.

## Lenguaje visual

### Color

La implementación posterior debe convertir esta dirección en tokens semánticos, no en hexágonos repetidos en componentes.

- `paper`: canvas claro de papel marfil.
- `paper-raised`: superficie cálida para fichas y controles.
- `ink`: texto principal grafito, no negro puro.
- `ink-secondary` y `ink-muted`: dos niveles explícitos de lectura secundaria.
- `slate`: azul pizarra para estructura y navegación discreta.
- `copper`: único acento de producto para puntuación, selección y acciones primarias.
- `moss`, `warning` y `danger`: colores semánticos reservados para estados, no decoración.
- En oscuro, el canvas será carbón azulado y las superficies subirán solo algunos puntos de luminosidad; el cobre se desaturará para no deslumbrar.

No habrá gradientes, neón ni `*` como color de acento. El cobre debe ocupar una fracción pequeña de la pantalla y señalar significado: foco, puntuación o acción.

### Tipografía

- **Titulares y nombres de juegos:** una serif editorial de alto contraste moderado, con `text-wrap: balance` y tracking óptico ligeramente negativo en tamaños grandes.
- **Interfaz, filtros y metadatos:** una sans técnica legible, con tres pesos deliberados: valor, etiqueta y metadato.
- **Números de puntuación y años:** cifras tabulares para evitar saltos de layout.
- La escala partirá de un cuerpo de 14–16 px y una proporción cercana a 1.25; la diferencia entre niveles la harán peso, color y espacio además del tamaño.

### Profundidad y superficies

Se usará una estrategia de **cambios de superficie y bordes silenciosos**. Las fichas no flotarán como tarjetas de dashboard: se distinguirán por tono, ritmo y una línea de separación de baja opacidad. Los controles tendrán una superficie de entrada ligeramente más profunda que el canvas y un anillo de foco claramente visible. No se mezclarán sombras dramáticas con bordes gruesos.

### Ritmo y densidad

- Base de espaciado: 4 px; los grupos principales usarán múltiplos de 8 px.
- Densidad: compacta en filtros y metadatos, respirada alrededor del foco editorial.
- Los controles tendrán al menos 40 px de altura visual y un área accionable de 44 px cuando sea necesario.
- Radios pequeños para controles, medios para fichas y uno mayor solo para superficies principales; nunca una píldora global.

## Estados que deben existir desde el diseño

La dirección incluye estados, no solo el caso de éxito: carga de catálogo, catálogo vacío, error de IGDB, ausencia de imagen, filtro sin coincidencias, sesión vencida, AuthUser/Game no disponible, favorito guardado, favorito duplicado y eliminación confirmada. Cada estado conservará la tira de índice o una variante de marcador de archivo para que la interfaz no parezca otra aplicación cuando falten datos.

El foco de teclado será visible en cobre, los mensajes se asociarán a sus controles, el contraste se comprobará en ambos temas y ninguna información dependerá de color o hover. El movimiento será breve, basado en opacidad/transformación y respetará `prefers-reduced-motion`.

## Patrones genéricos rechazados

1. **Neón, glow y glassmorphism de videojuego** → archivo editorial con cobre escaso y superficies materiales.
2. **Sidebar permanente de SaaS** → barra de catálogo y filtros junto al contenido que se consulta.
3. **Grid homogéneo de cards con imagen arriba** → pieza focal más una estantería de fichas con tira de índice.
4. **Dashboard de métricas para la portada** → puntuación como señal editorial dentro de la historia de cada juego.
5. **Iconos sin etiqueta y acciones ambiguas** → controles nativos, texto claro y estados accesibles.

## Criterios para las siguientes tareas

- GB-006.02 puede inicializar la aplicación sin inventar componentes visuales ni cambiar esta composición.
- GB-006.03 debe traducir `paper`, `ink`, `slate`, `copper` y los estados semánticos a tokens claro/oscuro, además de implementar las preferencias acordadas.
- GB-006.05 debe conservar la barra de catálogo, la tira de índice y el orden de foco de las vistas.
- GB-006.06 debe revisar desktop y móvil, ambos temas, inglés y español, y verificar carga, vacío, error y foco.

## Decisión pendiente

Esta propuesta evita código de UI y no crea todavía `.interface-design/system.md`. La aprobación del autor debe confirmar el concepto «archivo de juegos / guía de campo» y la firma de la tira de índice antes de consolidar tokens y componentes en GB-006.03–GB-006.05.
