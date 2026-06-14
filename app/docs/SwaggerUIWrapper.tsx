"use client";

import { useEffect, useRef } from "react";
import "swagger-ui-react/swagger-ui.css";

/**
 * Swagger UI dimuat secara dynamic di luar React StrictMode
 * untuk menghindari warning UNSAFE_componentWillReceiveProps
 * yang berasal dari internal library swagger-ui-react (bukan dari kode kita).
 */
export default function SwaggerUIWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    import("swagger-ui-react").then(({ default: SwaggerUI }) => {
      if (destroyed || !containerRef.current) return;

      const { createRoot } = require("react-dom/client");
      const { createElement } = require("react");

      const root = createRoot(containerRef.current);
      root.render(
        // Render tanpa StrictMode wrapper agar tidak ada duplikasi lifecycle call
        // yang memicu warning dari swagger-ui internal components
        createElement(SwaggerUI, {
          url: "/api/docs",
          docExpansion: "list",
          defaultModelsExpandDepth: 1,
          displayRequestDuration: true,
          tryItOutEnabled: true,
          filter: true,
          persistAuthorization: true,
        })
      );

      return () => {
        destroyed = true;
        root.unmount();
      };
    });

    return () => {
      destroyed = true;
    };
  }, []);

  return <div ref={containerRef} />;
}
