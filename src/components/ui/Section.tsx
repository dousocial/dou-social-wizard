import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div";
  spacing?: "sm" | "md" | "lg" | "hero";
}

export function Section({
  as: Tag = "section",
  className,
  spacing = "md",
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(
        spacing === "sm"   && "py-12 md:py-16",
        spacing === "md"   && "py-20 md:py-28",
        spacing === "lg"   && "py-28 md:py-40",
        spacing === "hero" && "pt-14 pb-20 md:pt-16 md:pb-28",
        className
      )}
      {...props}
    />
  );
}
