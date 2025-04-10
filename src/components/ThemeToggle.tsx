"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Check if there's a theme preference in local storage
    const storedTheme = localStorage.getItem("theme") as
      | "dark"
      | "light"
      | null;

    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    }
  }, []);

  const applyTheme = (newTheme: "dark" | "light") => {
    // Update document classes
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(newTheme);

    // Update body styles for light/dark theme
    if (newTheme === "light") {
      document.body.classList.add("bg-white", "text-neutral-900");
      document.body.classList.remove("bg-neutral-950", "text-white");

      // Apply light theme to prose sections
      document.querySelectorAll(".prose").forEach((el) => {
        el.classList.add("light-prose");
        el.classList.remove("prose-invert");
      });

      // Apply light theme to headers and footers
      document.querySelectorAll("header, footer").forEach((el) => {
        el.classList.add("bg-neutral-100", "border-neutral-200");
        el.classList.remove("bg-neutral-950", "border-neutral-800");
      });

      // Update cards and other UI elements
      document
        .querySelectorAll('.card, .bg-neutral-900, [class*="bg-neutral-900"]')
        .forEach((el) => {
          el.classList.add("bg-neutral-50", "border-neutral-200");
          el.classList.remove("bg-neutral-900", "border-neutral-800");
        });

      // Fix note article/container backgrounds
      document.querySelectorAll("article").forEach((el) => {
        el.classList.add("bg-neutral-50", "border-neutral-200");
        el.classList.remove("bg-neutral-900", "border-neutral-800");
      });

      // Fix specific text colors
      document
        .querySelectorAll(".text-white, .text-neutral-300")
        .forEach((el) => {
          el.classList.add("text-neutral-900");
          el.classList.remove("text-white", "text-neutral-300");
        });
    } else {
      document.body.classList.add("bg-neutral-950", "text-white");
      document.body.classList.remove("bg-white", "text-neutral-900");

      // Apply dark theme to prose sections
      document.querySelectorAll(".prose").forEach((el) => {
        el.classList.remove("light-prose");
        el.classList.add("prose-invert");
      });

      // Apply dark theme to headers and footers
      document.querySelectorAll("header, footer").forEach((el) => {
        el.classList.remove("bg-neutral-100", "border-neutral-200");
        el.classList.add("bg-neutral-950", "border-neutral-800");
      });

      // Update cards and other UI elements
      document
        .querySelectorAll('.card, .bg-neutral-50, [class*="bg-neutral-50"]')
        .forEach((el) => {
          el.classList.remove("bg-neutral-50", "border-neutral-200");
          el.classList.add("bg-neutral-900", "border-neutral-800");
        });

      // Fix note article/container backgrounds
      document.querySelectorAll("article").forEach((el) => {
        el.classList.remove("bg-neutral-50", "border-neutral-200");
        el.classList.add("bg-neutral-900", "border-neutral-800");
      });

      // Fix specific text colors
      document.querySelectorAll(".text-neutral-900").forEach((el) => {
        el.classList.remove("text-neutral-900");
        el.classList.add("text-white");
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    applyTheme(newTheme);

    // Save preference to local storage
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`w-9 h-9 ${
        theme === "dark"
          ? "bg-transparent border-neutral-700 hover:bg-neutral-800"
          : "bg-white border-neutral-200 hover:bg-neutral-100"
      }`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-yellow-300" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-400" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
