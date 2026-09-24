# GameBook.Frontend

[Leer este README en inglés](README.md)

`GameBook.Frontend` es la aplicación web Next.js de GameBook, un proyecto de portfolio para explorar videojuegos y administrar favoritos personales.

## Responsabilidad

El frontend ofrecerá las vistas públicas del catálogo y los detalles de juegos, las experiencias autenticadas de cuenta y favoritos, y preferencias persistentes de tema claro/oscuro e idioma inglés/español. Su código de servidor consultará IGDB mediante credenciales de aplicación de Twitch sin exponerlas, y el navegador consumirá los servicios AuthUser y Game.

## Estado del repositorio

Este repositorio contiene la base de Next.js con App Router. Las funcionalidades, los tokens visuales, los adaptadores de proveedores y el despliegue están programados intencionadamente como tareas SDD posteriores.

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

## Estructura

- `src/app/` — shell de App Router y fronteras de rutas servidoras.
- `src/app/api/igdb/` y `src/app/api/twitch/` — rutas reservadas para servidor; las credenciales nunca deben entrar en componentes cliente.
- `src/features/` — UI orientada al producto y composición de funcionalidades.
- `src/server/` — clientes de proveedores y código exclusivo del servidor.
- `src/shared/` — primitivas reutilizables y contratos compartidos.

Los nombres de variables de runtime se documentan sin valores: `NEXT_PUBLIC_AUTHUSER_URL`, `NEXT_PUBLIC_GAME_URL`, `IGDB_CLIENT_ID` e `IGDB_CLIENT_SECRET`.

## Proyectos relacionados

- [GameBook.Microservice.AuthUser](https://github.com/CarlosSV923/GameBook.Microservice.AuthUser)
- [GameBook.Microservice.Game](https://github.com/CarlosSV923/GameBook.Microservice.Game)
