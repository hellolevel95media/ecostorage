import Link from "next/link";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import type { Service } from "@/types/database";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover">
      <MediaPlaceholder ratio="video" kind={service.video_url ? "video" : "image"} label={service.title} />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold">{service.title}</h3>
        {service.description && (
          <p className="mt-2 flex-1 text-sm text-foreground/70">{service.description}</p>
        )}
        <Link
          href={service.cta_link ?? "/contact"}
          className="mt-4 text-sm font-semibold text-brand hover:underline"
        >
          {service.cta_text ?? "Learn more"} →
        </Link>
      </div>
    </div>
  );
}
