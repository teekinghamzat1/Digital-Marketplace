"use client";

import { useEffect, useState } from "react";

export function DynamicStyles() {
  const [styles, setStyles] = useState({
    primary: "#f97316",
    secondary: "#fb923c",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.primaryColor || data.secondaryColor) {
          setStyles({
            primary: data.primaryColor || styles.primary,
            secondary: data.secondaryColor || styles.secondary,
          });
        }
      })
      .catch(err => console.error("Failed to load dynamic styles:", err));
  }, []);

  return (
    <style jsx global>{`
      :root {
        --color-primary: ${styles.primary};
        --color-primary-hover: ${styles.primary}dd;
        --color-secondary: ${styles.secondary};
      }
    `}</style>
  );
}
