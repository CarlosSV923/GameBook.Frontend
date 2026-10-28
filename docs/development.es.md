# Desarrollo

## Configuración local

Usa Node.js 24 y pnpm 12.4.1 (Corepack). Copia `.env.example` a `.env`; la plantilla solo contiene nombres. Configura valores locales en privado y ejecuta:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

La aplicación se ejecuta en `http://localhost:3000`. El catálogo público requiere credenciales de aplicación IGDB/Twitch. Los flujos autenticados también necesitan los servicios AuthUser y Game; ejecútalos en sus repositorios hermanos o usa el Compose de integración local descrito en [GameBook.System](https://github.com/CarlosSV923/GameBook.System).

## Variables de entorno

| Variable                   | Significado                                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `IGDB_CLIENT_ID`           | ID de cliente de la aplicación Twitch que usa el servidor para solicitar un token de acceso a IGDB.                                |
| `IGDB_CLIENT_SECRET`       | Secreto de cliente Twitch; solo se usa en el servidor.                                                                             |
| `NEXT_PUBLIC_AUTHUSER_URL` | URL base de AuthUser para solicitudes del navegador, sin sufijo `/v1`.                                                             |
| `NEXT_PUBLIC_GAME_URL`     | URL base de Game para solicitudes del navegador, sin sufijo `/v1`.                                                                 |
| `PORT`                     | Puerto opcional donde escucha Next.js.                                                                                             |
| `FAKE_IGDB_PORT`           | Puerto de pruebas del servidor local IGDB/Twitch falso.                                                                            |
| `IGDB_API_BASE_URL`        | Sobrescritura opcional de la API IGDB, aceptada solo para hosts loopback; se usa con el servidor IGDB falso de E2E.                |
| `TWITCH_TOKEN_URL`         | Sobrescritura opcional del endpoint de tokens Twitch, aceptada solo para hosts loopback; se usa con el servidor IGDB falso de E2E. |

Usa aplicaciones IGDB/Twitch distintas para desarrollo y producción. Ambos entornos usan los nombres `IGDB_CLIENT_ID` e `IGDB_CLIENT_SECRET`; configura las credenciales correspondientes solo en cada entorno. Nunca pongas valores de producción en archivos locales ni en el control de versiones.

Las configuraciones Playwright de E2E y capturas inician `tests/e2e/fake-igdb-server.mjs` en loopback y dirigen allí las solicitudes a la API IGDB y al endpoint de tokens mediante `IGDB_API_BASE_URL` y `TWITCH_TOKEN_URL`. El servidor falso y los fixtures del navegador devuelven juegos ficticios; ninguno de los flujos necesita credenciales reales de IGDB o Twitch.

## Comandos de calidad

| Comando             | Qué ejecuta                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm test`         | Pruebas unitarias Vitest una vez.                                                          |
| `pnpm test:e2e`     | Proyectos Playwright de pruebas E2E del navegador.                                         |
| `pnpm screenshots`  | Suite Playwright que genera capturas e imágenes/GIF del README con fixtures ficticios.     |
| `pnpm format`       | Formatea código fuente, pruebas y configuraciones raíz JavaScript/TypeScript con Prettier. |
| `pnpm format:check` | Comprueba esos archivos fuente, pruebas y configuraciones con Prettier.                    |
| `pnpm lint`         | Ejecuta ESLint en el repositorio.                                                          |
| `pnpm typecheck`    | Comprueba TypeScript sin generar archivos.                                                 |
| `pnpm build`        | Genera la compilación de producción de Next.js.                                            |

Para ejecutar localmente el modo de producción, usa `pnpm build` y luego `pnpm start`.

## Release y despliegue

El workflow release-please se ejecuta al recibir cambios en `main` y mediante ejecución manual. Abre o actualiza una solicitud de release a partir de los commits Conventional Commits en `main`; al fusionarla crea la etiqueta de versión y el release de GitHub. Los cambios llegan a `main` mediante un PR de promoción `develop` → `main`, seguido por el PR de release-please.

Después de cada release, el workflow abre un PR de sincronización `main` → `develop` si no hay uno abierto. Fusiónalo con un merge commit.

Vercel despliega el frontend desde `main` en [gamebook-frontend.vercel.app](https://gamebook-frontend.vercel.app). Configura `NEXT_PUBLIC_AUTHUSER_URL`, `NEXT_PUBLIC_GAME_URL`, `IGDB_CLIENT_ID` e `IGDB_CLIENT_SECRET` en el proyecto de Vercel. `vercel.json` habilita despliegues Git solo para `main`. Los servicios backend se despliegan de forma independiente en Render; este repositorio no configura despliegues preview para backends.

## Docker

Este repositorio incluye un `Dockerfile` de producción; no incluye un archivo Compose. La configuración e instrucciones del Compose local de varios repositorios se mantienen en [GameBook.System](https://github.com/CarlosSV923/GameBook.System).
