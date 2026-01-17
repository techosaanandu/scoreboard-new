"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return null
  }

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="ml-1 mr-1 h-8 w-8 rounded p-1 sm:ml-4"
      onClick={() => setTheme(theme === "dark" || resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && (theme === "dark" || resolvedTheme === "dark") ? (
        <Sun className="h-6 w-6 text-yellow-500 hover:text-yellow-400 transition-all" />
      ) : (
        <Moon className="h-6 w-6 text-blue-900 hover:text-blue-700 transition-all" />
      )}
    </button>
  )
}

export default ThemeSwitch
