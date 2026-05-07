import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageHeader({ title, subtitle, actions, backHref }) {
  return (
    <div className="pb-4 mb-6 border-b border-[#E8DFD4]">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mb-2"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      )}

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-medium text-neutral-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral-600 mt-0.5">{subtitle}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
