# GameBook.Frontend

[Leer este README en inglés](README.md)

`GameBook.Frontend` es la aplicación web Next.js de GameBook, un proyecto de portfolio para explorar videojuegos y administrar favoritos personales.

## Responsabilidad

El frontend ofrecerá las vistas públicas del catálogo y los detalles de juegos, las experiencias autenticadas de cuenta y favoritos, y preferencias persistentes de tema claro/oscuro e idioma inglés/español. Su código de servidor consultará IGDB mediante credenciales de aplicación de Twitch sin exponerlas, y el navegador consumirá los servicios AuthUser y Game.

## Estado del repositorio

Este repositorio contiene la base de Next.js con App Router, el primer sistema visual, el adaptador de IGDB exclusivo del servidor y la vista inicial de tarjetas del catálogo público. Los filtros, el detalle, las experiencias autenticadas y el despliegue siguen programados como tareas SDD posteriores.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Comprobaciones de calidad:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

### Integración local con AuthUser

Ejecuta `GameBook.Microservice.AuthUser` en `http://localhost:3001` y permite
el origen exacto del Frontend con `CORS_ALLOWED_ORIGINS=http://localhost:3000`.
Añade la siguiente variable local ignorada en `.env`:

```bash
NEXT_PUBLIC_AUTHUSER_URL=http://localhost:3001
```

Reinicia el servidor de desarrollo de Next.js después de cambiar una variable
`NEXT_PUBLIC_`. El Frontend soporta entonces localmente el flujo de registro,
inicio de sesión, sesión, perfil y revocación por cambio de contraseña sin
exponer secretos de AuthUser.

### Integración local con Game

Ejecuta `GameBook.Microservice.Game` en `http://localhost:3002`, configura su
`.env` ignorado con `AUTHUSER_URL=http://localhost:3001` y el origen exacto del
navegador `CORS_ALLOWED_ORIGINS=http://localhost:3000`, y añade la siguiente
variable local ignorada en el Frontend:

```bash
NEXT_PUBLIC_GAME_URL=http://localhost:3002
```

Reinicia el servidor de desarrollo de Next.js después de cambiar
`NEXT_PUBLIC_GAME_URL`. La vista autenticada de favoritos enviará el mismo JWT
de AuthUser a Game para listar, filtrar, sugerir, sincronizar instantáneas y
eliminar favoritos.

### Revisión de favoritos

La revisión GB-011.06 cubre la redirección del visitante al inicio de sesión,
las acciones autenticadas de favoritos, los límites del Bearer de Game, el
fallback del detalle cuando IGDB falla, los textos en inglés y español, la
persistencia del tema y el diseño responsive del catálogo. Ejecuta la revisión
automatizada con:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

La revisión en navegador usa el catálogo público en escritorios y breakpoints
móviles; el detalle conserva los datos almacenados de la tarjeta cuando IGDB no
está disponible, y la bandeja autenticada conserva los mismos filtros,
paginación y patrones de confirmación del catálogo.

## Estructura

- `src/app/` — shell de App Router y fronteras de rutas servidoras.
- `src/app/api/igdb/` — rutas proxy de IGDB exclusivas del servidor para catálogo, detalle y sugerencias; las credenciales nunca deben entrar en componentes cliente.
- `src/app/api/twitch/` — rutas reservadas para futuras necesidades de Twitch.
- `src/features/` — UI orientada al producto y composición de funcionalidades.
- `src/server/` — clientes de proveedores y código exclusivo del servidor.
- `src/shared/` — primitivas reutilizables y contratos compartidos.

Las preferencias visuales funcionan sin cuenta: el tema sigue al sistema en la primera visita, las elecciones manuales claro/oscuro persisten en `gamebook.theme` y las elecciones entre inglés/español persisten en `gamebook.language`.

Los nombres de variables de runtime se documentan sin valores: `NEXT_PUBLIC_AUTHUSER_URL`, `NEXT_PUBLIC_GAME_URL`, `IGDB_CLIENT_ID` e `IGDB_CLIENT_SECRET`.

El navegador público solo se comunica con el proxy del frontend: `GET /api/igdb/games`, `GET /api/igdb/games/:igdbId`, `GET /api/igdb/games/suggestions?query=...` y `GET /api/igdb/platforms?query=...`. El proxy obtiene y renueva el token de aplicación de Twitch en el servidor, usa endpoints fijos de IGDB y aplica los límites contractuales de cuatro solicitudes por segundo y ocho solicitudes concurrentes.

## Proyectos relacionados

- [GameBook.Microservice.AuthUser](https://github.com/CarlosSV923/GameBook.Microservice.AuthUser)
- [GameBook.Microservice.Game](https://github.com/CarlosSV923/GameBook.Microservice.Game)
