import type { Metadata } from "next";
import SwaggerUIWrapper from "./SwaggerUIWrapper";

export const metadata: Metadata = {
  title: "Opero API Documentation",
  description: "Dokumentasi lengkap API multi-tenant Opero menggunakan OpenAPI 3.0 / Swagger UI",
};

export default function DocsPage() {
  return (
    <main>
      <SwaggerUIWrapper />
    </main>
  );
}
