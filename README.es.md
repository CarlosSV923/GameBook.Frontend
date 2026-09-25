# GameBook.Frontend

[Leer este README en inglés](README.md)

`GameBook.Frontend` es la aplicación web Next.js de GameBook. Permite consultar el catálogo público de IGDB y permite a las personas autenticadas administrar sus propios juegos favoritos.

## Responsabilidad

El frontend es responsable de la experiencia del navegador, los flujos de cuenta y sesión, la interfaz de favoritos, la presentación responsive, la preferencia persistente de tema y la preferencia de idioma inglés/español. Consume AuthUser y Game para las operaciones de GameBook. Su adaptador de IGDB, exclusivo del servidor, se autentica con credenciales de aplicación de Twitch para que nunca lleguen al navegador.

El navegador no llama directamente a IGDB. El servidor Next.js expone las rutas proxy locales `/api/igdb/*`, obtiene y renueva el token de aplicación de Twitch, aplica los límites contractuales de cuatro solicitudes por segundo y ocho solicitudes concurrentes, y transforma los fallos del proveedor al contrato de API del frontend.

## Arquitectura implementada

- `src/app/` — páginas de Next.js App Router, layout y límites de rutas API del servidor.
- `src/app/api/igdb/` — rutas proxy exclusivas del servidor para catálogo, detalle, sugerencias y plataformas.
- `src/features/` — funcionalidades de autenticación, catálogo, favoritos, perfil, navegación y preferencias.
- `src/server/` — clientes exclusivos del servidor para IGDB y Twitch, limitación de solicitudes y errores del proveedor.
- `src/shared/` — contratos de API, almacenamiento de sesión del navegador, mensajes i18n, preferencias y primitivas UI reutilizables.

El navegador almacena el JWT de GameBook en `sessionStorage`. Las peticiones autenticadas lo envían como `Authorization: Bearer <token>` a AuthUser y Game. El catálogo público está disponible sin cuenta de GameBook.

## Configuración local

Requisitos previos:

- Node.js 24 o una versión LTS compatible.
- pnpm 12.4.1, habilitado mediante Corepack.
- Credenciales locales de prueba para IGDB/Twitch al probar el catálogo público.
- Los repositorios hermanos AuthUser y Game para la integración local completa.

Instala las dependencias e inicia el servidor de desarrollo:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

El frontend queda disponible por defecto en `http://localhost:3000`.

## Variables de runtime

Crea un archivo `.env` privado e ignorado por Git. Los nombres de variables requeridos por el frontend se muestran sin valores:

```dotenv
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=
NEXT_PUBLIC_AUTHUSER_URL=
NEXT_PUBLIC_GAME_URL=
```

`IGDB_CLIENT_ID` e `IGDB_CLIENT_SECRET` solo son leídas por código del servidor. Las dos variables `NEXT_PUBLIC_` son las URLs base usadas por los clientes del navegador y no deben contener el sufijo `/v1`. No confirmes archivos `.env` ni credenciales. Reinicia el servidor Next.js después de cambiar una variable `NEXT_PUBLIC_`.

## Integración local de servicios

Ejecuta AuthUser en el puerto local 3001 y Game en el puerto local 3002. AuthUser debe permitir el origen exacto `http://localhost:3000`; Game debe permitir el mismo origen y resolver AuthUser mediante su propia configuración `AUTHUSER_URL`.

Los endpoints locales son:

| Servicio | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Swagger UI de AuthUser | `http://localhost:3001/docs` |
| JSON OpenAPI de AuthUser | `http://localhost:3001/docs/openapi.json` |
| Swagger UI de Game | `http://localhost:3002/docs` |
| JSON OpenAPI de Game | `http://localhost:3002/docs/openapi.json` |

El frontend soporta registro, inicio de sesión, acceso a sesión/perfil, cambio y revocación de contraseña, listado y filtrado de favoritos, sugerencias, sincronización de instantáneas y eliminación mediante esos servicios.

## Docker Compose local

`compose.yaml` es el punto de entrada de desarrollo para los tres repositorios hermanos. Desde el repositorio frontend, copia las plantillas de entorno ignoradas y complétalas con credenciales locales de prueba:

```bash
copy compose.authuser.env.example compose.authuser.env
copy compose.game.env.example compose.game.env
copy compose.frontend.env.example compose.frontend.env
docker compose up --build
```

Las plantillas contienen únicamente nombres de variables:

- `compose.authuser.env`: `AUTH_DATABASE_URL`, `JWT_AUDIENCE`, `JWT_ISSUER`, `JWT_PRIVATE_KEY`.
- `compose.game.env`: `GAME_DATABASE_URL`, `JWT_AUDIENCE`, `JWT_ISSUER`, `JWT_PUBLIC_KEY`.
- `compose.frontend.env`: `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`.

Compose inyecta las URLs y puertos locales de los tres contenedores. Usa los roles runtime de Neon `develop`, no inicia otro contenedor PostgreSQL y no ejecuta migraciones de Prisma. Las variables exclusivas de migración, como `AUTH_DATABASE_DIRECT_URL` y `GAME_DATABASE_DIRECT_URL`, nunca deben incluirse en estos archivos. Conserva privados los archivos copiados y las claves PEM.

Detén el stack con `docker compose down`. Usa `docker compose down -v` solo si quieres eliminar intencionalmente los volúmenes locales de dependencias.

## Pruebas y comprobaciones de calidad

```bash
pnpm test
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

## Proyectos relacionados

- [GameBook.Microservice.AuthUser](https://github.com/CarlosSV923/GameBook.Microservice.AuthUser)
- [GameBook.Microservice.Game](https://github.com/CarlosSV923/GameBook.Microservice.Game)
