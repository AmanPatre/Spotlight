"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * next-themes 0.4.6 intentionally injects an inline <script> for SSR
 * theme-flicker prevention. React 19 flags this as a warning — it is a
 * known false-positive because the library is currently unmaintained.
 * We suppress only that specific message so the rest of the console stays clean.
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const _orig = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return
    }
    _orig(...args)
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}                                                   