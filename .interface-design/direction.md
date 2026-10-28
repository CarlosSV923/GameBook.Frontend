# GameBook — Dirección de interfaz

Estado: **GB-006 es el origen de la identidad aprobada** «archivo de juegos / guía de campo». El autor eligió **Dirección A «Archive Refined»** como dirección vigente el **2026-10-24**. La dirección A conserva esa identidad y la vuelve más concreta; no la sustituye. La referencia de composición son los artboards aprobados `Main.dc.html` (escritorio, 1440) y `ArchivePhone.dc.html` (teléfono, 390). El sistema implementable está en [system.md](system.md) y sirve de contrato para GB-017.02–.08.

## Intención

GameBook es un archivo curado para descubrir, comparar y conservar videojuegos. La persona llega para consultar un ranking fiable, identificar un juego y decidir si quiere guardarlo en su colección. La interfaz se siente como una guía de campo bien impresa: editorial, técnica y tranquila. La información del catálogo y la tira de índice deben conducir la mirada; la decoración no compite con ellas.

El dominio aporta el vocabulario visual: archivo y estantería, ficha de juego, índice de plataformas, cronología de lanzamientos, puntuación agregada, colección personal y curaduría. El mundo material es papel marfil, tinta grafito, carbón azulado, azul pizarra, cobre envejecido, verde musgo y superficies elevadas de papel cálido. La **tira de índice** es la firma propia: reúne posición, puntuación sobre 100, año y plataformas junto a cada juego, como un lomo consultable.

## Dirección A: «Archive Refined»

La composición aprobada reduce la introducción para que el ranking llegue pronto al primer plano. Enmienda 2026-10-27: el catálogo y los favoritos usan las fichas póster de la opción B (portada 3:4 sin recorte, etiqueta de puntuación, título y «año · plataformas»), en cinco columnas en escritorio y dos en teléfono. La tira de índice queda para el detalle y los estados. Newsreader aporta el carácter editorial; IBM Plex Sans ordena controles y lectura; IBM Plex Mono da estabilidad a posiciones, puntuaciones y años.

### Cambios respecto a la UI publicada

La revisión de portfolio del 2026-10-24 identificó estos desajustes que la dirección A corrige:

- **La tira de índice en las tarjetas:** con listas largas de plataformas estiraba las filas; desde 2026-10-27 acompaña el detalle y los estados, y la ficha muestra la puntuación en una etiqueta sobre el póster.
- **Portadas recortadas:** la portada 4:3 recortaba los pósters de IGDB; desde 2026-10-27 la ficha es un póster 3:4 completo sobre título y metadatos, con la paleta y la tipografía de la dirección A.
- **Acciones primarias que parecen deshabilitadas:** usan cobre de producto, texto contrastado, peso y estado de interacción inequívocos. Las acciones secundarias siguen siendo neutras.
- **Hero demasiado grande:** pasa de aproximadamente el 45 % del primer viewport a una introducción compacta, de hasta cerca de un tercio de 1440 × 900. El ranking aparece antes del pliegue.
- **Scrim de modal lavado:** el modal usa una capa oscura semitransparente tanto en tema claro como oscuro; portada, título y puntuación mantienen la prioridad y los metadatos se leen como ficha técnica.
- **Cabecera móvil de tres filas:** se reduce a una fila con marca, control de tema y menú. La búsqueda permanece visible; filtros y navegación se abren en paneles accesibles.
- **Puntuación presentada como 0–10:** se muestra la escala real de IGDB, de 0 a 100, con cifras tabulares y sin conversión ambigua.

La cabecera de escritorio también queda en una fila. Bajo el hero, filtros de nombre, plataforma y año comparten una barra horizontal pegajosa al desplazarse. El encabezado del catálogo dice «Top rated of all time» (traducido según el idioma) y la atribución de IGDB permanece visible. Las sugerencias de nombre y plataforma siguen funcionando por clic y teclado; los filtros combinados y el desplazamiento infinito conservan el comportamiento MVP.

## Vistas y alcance

| Vista                       | Jerarquía                                           | Composición                                                                          |
| --------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Catálogo                    | Ranking y fichas; filtros y contexto después        | Hero compacto, barra de filtros pegajosa y grid de pósters 3:4.                      |
| Favoritos                   | Colección personal y cada ficha                     | Mismo póster; acción contextual de eliminar con confirmación.                        |
| Detalle                     | Portada, título y puntuación; después ficha técnica | Modal centrado con scrim oscuro, metadatos, atribución y cierre accesible.           |
| Inicio de sesión y registro | Formulario y acción principal                       | Panel editorial compacto, errores asociados a campos y navegación entre formularios. |
| Perfil                      | Cambio de contraseña y desactivación                | Secciones legibles, confirmación antes de desactivar y estados visibles.             |

La dirección cubre catálogo, detalle, favoritos, autenticación, perfil, filtros y sugerencias, carga, vacío, error, final de resultados, alertas de disponibilidad, avisos de éxito/duplicado/error, confirmaciones y estados de carga, en claro/oscuro y EN/ES, en escritorio y móvil. Se mantienen las preferencias persistidas, el tooltip sin sesión y los textos originales de IGDB.

### Acciones de favoritos: corrección obligatoria

Se restablece el comportamiento especificado en `mvp.md` §4.4 y §4.5, tanto en tarjeta como en modal. Sin sesión, activar guardar abre junto a la acción el elemento contextual accesible **«Para guardar en favoritos debes:»**, con **«Iniciar sesión»** y **«Crear cuenta»**; en inglés, **“To save to favorites, you need to:”**, **“Sign in”** y **“Create account”**. Usa el mismo mensaje en ambos contextos, permite Escape y clic fuera, gestiona foco y comunica `aria-expanded`/`aria-controls`. No navega ni guarda hasta que la persona elija uno de los enlaces. Con sesión, guardar abre una confirmación contextual y solo confirmar ejecuta la mutación. Éxito, duplicado y error se anuncian; eliminar conserva la confirmación existente de `mvp.md` §6.

## Patrones que siguen rechazados

1. Neón, glow y glassmorphism de videojuego → superficies materiales y cobre escaso.
2. Sidebar permanente de SaaS → controles de catálogo junto al contenido.
3. Fichas con tira lateral y portada 4:3 → pósters 3:4 sin recorte con etiqueta de puntuación (enmienda 2026-10-27).
4. Dashboard de métricas como portada → ranking y puntuación dentro de la ficha del juego.
5. Acciones ambiguas basadas solo en iconos, color o hover → controles etiquetados, estados explícitos y foco visible.
6. Hero dominante que empuja el catálogo bajo el pliegue → introducción editorial compacta.
7. Scrim claro o translúcido sin suficiente separación → scrim oscuro constante en ambos temas.
8. Presentar la puntuación de 0–100 como 0–10 → conservar y rotular la escala real.

## Continuidad GB-017

GB-017.02 establece tokens Tailwind CSS 4, `next/font` y primitivas; .03 compone cabecera, hero y filtros; .04 lleva la tira a catálogo y favoritos; .05 define detalle y confirmaciones; .06 cubre cuenta, perfil, estados y avisos; .08 restaura la acción contextual y la confirmación de guardado. GB-017.07 retira el CSS heredado y revisa la experiencia completa. Los criterios de aceptación relacionados son `../specs/improvements.md` §9, criterios 2–4.
