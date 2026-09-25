import type { Language } from "@/shared/preferences/storage";

export const messages = {
  en: {
    home: {
      eyebrow: "Game archive / field guide",
      title: "A considered place for games worth keeping.",
      description:
        "GameBook brings discovery and personal favorites together in a quiet, readable archive.",
    },
    navigation: {
      account: "Account navigation",
      catalog: "Catalog",
      createAccount: "Create account",
      favorites: "Favorite games",
      primary: "Primary navigation",
      profile: "Profile",
      signIn: "Sign in",
      tagline: "Game archive / field guide",
    },
    catalog: {
      description:
        "Search the archive by name, platform, or launch year when the catalog is connected.",
      emptyDescription:
        "Your next search will bring the shelves to life. The same view will later hold public results and your saved games.",
      emptyTitle: "The shelves are ready for your next search.",
      eyebrow: "Public catalog",
      title: "Find a game worth keeping",
    },
    preferences: {
      eyebrow: "Archive settings",
      title: "Reading preferences",
      description: "Choose the atmosphere and language for your archive.",
      theme: "Theme",
      language: "Language",
      light: "Light",
      dark: "Dark",
      english: "English",
      spanish: "Español",
    },
    states: {
      errorDescription:
        "The catalog could not be reached. Your current view and preferences are still safe.",
      errorTitle: "The catalog is temporarily unavailable.",
      loading: "Loading catalog",
      retry: "Try again",
      noResults: "No games match these filters.",
    },
    indexStrip: {
      platforms: "Platforms",
      rating: "Rating",
      year: "Year",
    },
  },
  es: {
    home: {
      eyebrow: "Archivo de juegos / guía de campo",
      title: "Un lugar pensado para los juegos que vale la pena conservar.",
      description:
        "GameBook reúne descubrimiento y favoritos personales en un archivo sereno y legible.",
    },
    navigation: {
      account: "Navegación de cuenta",
      catalog: "Catálogo",
      createAccount: "Crear cuenta",
      favorites: "Juegos favoritos",
      primary: "Navegación principal",
      profile: "Perfil",
      signIn: "Iniciar sesión",
      tagline: "Archivo de juegos / guía de campo",
    },
    catalog: {
      description:
        "Busca en el archivo por nombre, plataforma o año de lanzamiento cuando el catálogo esté conectado.",
      emptyDescription:
        "Tu próxima búsqueda dará vida a las estanterías. Después, esta vista reunirá resultados públicos y juegos guardados.",
      emptyTitle: "Las estanterías esperan tu próxima búsqueda.",
      eyebrow: "Catálogo público",
      title: "Encuentra un juego que valga la pena conservar",
    },
    preferences: {
      eyebrow: "Ajustes del archivo",
      title: "Preferencias de lectura",
      description: "Elige el ambiente y el idioma de tu archivo.",
      theme: "Tema",
      language: "Idioma",
      light: "Claro",
      dark: "Oscuro",
      english: "English",
      spanish: "Español",
    },
    states: {
      errorDescription:
        "No se pudo acceder al catálogo. Tu vista y tus preferencias actuales siguen a salvo.",
      errorTitle: "El catálogo no está disponible temporalmente.",
      loading: "Cargando catálogo",
      retry: "Intentar de nuevo",
      noResults: "Ningún juego coincide con estos filtros.",
    },
    indexStrip: {
      platforms: "Plataformas",
      rating: "Puntuación",
      year: "Año",
    },
  },
} as const;

export type Messages = (typeof messages)[Language];
