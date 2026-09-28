import type { ReactNode } from "react";

interface CardCarouselProps {
  children: ReactNode;
  /** Desktop grid column classes, e.g. "lg:grid-cols-2 xl:grid-cols-4".
   * Below `lg` this renders as a horizontal scroll-snap carousel instead. */
  gridClassName?: string;
  className?: string;
}

/** CSS-only responsive grid/carousel: a horizontally scrollable, snapping
 * card row on mobile and tablet, switching to a regular grid at `lg`+. */
export function CardCarousel({
  children,
  gridClassName = "lg:grid-cols-2",
  className = "",
}: CardCarouselProps) {
  return (
    <div
      className={`flex snap-x snap-proximity gap-4 overflow-x-auto pb-2 [&>*]:w-[78%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[46%] lg:grid lg:snap-none lg:gap-6 lg:overflow-visible lg:pb-0 lg:[&>*]:w-auto lg:[&>*]:shrink ${gridClassName} ${className}`}
    >
      {children}
    </div>
  );
}
