import Link from "next/link";

export default function TenantNotFoundPage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] px-6 py-16 text-[#171717]">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">Tenant not found</p>
        <h1 className="mt-4 text-3xl font-semibold">This workspace does not exist.</h1>
        <p className="mt-4 text-base text-[#5f5a52]">
          Check the subdomain spelling or ask the workspace owner for a valid invite.
        </p>
        <Link className="mt-8 inline-flex rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white" href="/">
          Back to OPERO
        </Link>
      </div>
    </main>
  );
}
