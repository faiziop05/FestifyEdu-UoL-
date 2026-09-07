import { useState, useEffect } from "react";

const useThemeObserver = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 1. Check if the root element already has data-theme
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr) return attr === "dark";
    
    // 2. Fallback to localStorage if the ThemeToggle hasn't set it yet
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme) return savedTheme === "dark";
    
    // 3. Fallback to OS preference
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Set up a mutation observer to listen for changes to the data-theme attribute on <html>
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          setIsDarkMode(document.documentElement.getAttribute("data-theme") === "dark");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return isDarkMode;
};

export default useThemeObserver;
