import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} MegaPX. Local-first calculators.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link className="hover:text-foreground" href="/settings">
            Settings
          </Link>
          <Link className="hover:text-foreground" href="/history">
            History
          </Link>
          <Link className="hover:text-foreground" href="/templates">
            Templates
          </Link>
        </div>
      </div>
    </footer>
  );
};
