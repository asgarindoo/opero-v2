import Link from "next/link";

export default function TenantInactivePage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] px-6 py-16 text-[#171717]">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">Workspace inactive</p>
        <h1 className="mt-4 text-3xl font-semibold">This tenant is currently inactive.</h1>
        <p className="mt-4 text-base text-[#5f5a52]">
          Contact the workspace owner or support before continuing.
        </p>
        <Link className="mt-8 inline-flex rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white" href="/tenants">
          Back to workspaces
        </Link>
      </div>
    </main>
  );
}
