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

## Despliegue de producción

El frontend público de GameBook está desplegado en Vercel en [`https://gamebook-frontend.vercel.app`](https://gamebook-frontend.vercel.app). Sus dependencias productivas son AuthUser en [`https://gamebook-microservice-authuser.onrender.com`](https://gamebook-microservice-authuser.onrender.com) y Game en [`https://gamebook-microservice-game.onrender.com`](https://gamebook-microservice-game.onrender.com). AuthUser y Game exponen su Swagger UI productivo en [`/docs`](https://gamebook-microservice-authuser.onrender.com/docs) y [`/docs`](https://gamebook-microservice-game.onrender.com/docs), respectivamente.

Las credenciales de producción permanecen en la configuración del servidor/proveedor y nunca se confirman en este repositorio.

## Variables de runtime

Copia `.env.example` a un archivo `.env` privado e ignorado por Git y completa solo los valores locales. La plantilla contiene los nombres de variables requeridos por el frontend sin valores:

```dotenv
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=
NEXT_PUBLIC_AUTHUSER_URL=
NEXT_PUBLIC_GAME_URL=
PORT=
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

## Ejecución local individual

Este repositorio se ejecuta de forma independiente con el servidor de desarrollo de Next.js; no requiere orquestación de contenedores. Para probar los flujos autenticados, inicia AuthUser y Game por separado en sus propios repositorios y configura las cuatro variables del frontend indicadas arriba.

Desde este repositorio, después de copiar `.env.example` a `.env`:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Usa `pnpm start` después de crear un build de producción con `pnpm build`. El frontend permanece disponible en `http://localhost:3000`; AuthUser y Game documentan sus propios comandos de inicio y documentación local de API en sus repositorios.

## Pruebas y comprobaciones de calidad

```bash
pnpm test
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

## Política de release y despliegue

Los commits siguen Conventional Commits. El workflow `release-please` se ejecuta únicamente con pushes a `main` o mediante ejecución manual, usa los archivos manifest del repositorio y se autentica con los permisos mínimos de `GITHUB_TOKEN` necesarios para crear pull requests de release y releases de GitHub. El CI normal valida los pull requests y `main`; el commit del release se valida mediante CI después de fusionar el pull request de release.

`vercel.json` deshabilita los deployments automáticos de Git para cualquier rama excepto `main`. En esta etapa este repositorio no crea proyectos ni deployments de producción en Vercel.

## Proyectos relacionados

- [GameBook.Microservice.AuthUser](https://github.com/CarlosSV923/GameBook.Microservice.AuthUser)
- [GameBook.Microservice.Game](https://github.com/CarlosSV923/GameBook.Microservice.Game)
