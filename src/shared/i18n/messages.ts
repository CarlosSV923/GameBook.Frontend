import type { Language } from "@/shared/preferences/storage";

export const messages = {
  en: {
    home: {
      eyebrow: "Game archive / field guide",
      title: "A considered place for games worth keeping.",
      description:
        "GameBook brings discovery and personal favorites together in a quiet, readable archive.",
    },
    preferences: {
      title: "Reading preferences",
      description: "Choose the atmosphere and language for your archive.",
      theme: "Theme",
      language: "Language",
      light: "Light",
      dark: "Dark",
      english: "English",
      spanish: "Español",
    },
  },
  es: {
    home: {
      eyebrow: "Archivo de juegos / guía de campo",
      title: "Un lugar pensado para los juegos que vale la pena conservar.",
      description:
        "GameBook reúne descubrimiento y favoritos personales en un archivo sereno y legible.",
    },
    preferences: {
      title: "Preferencias de lectura",
      description: "Elige el ambiente y el idioma de tu archivo.",
      theme: "Tema",
      language: "Idioma",
      light: "Claro",
      dark: "Oscuro",
      english: "English",
      spanish: "Español",
    },
  },
} as const;

export type Messages = (typeof messages)[Language];
