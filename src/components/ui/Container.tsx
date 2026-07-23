import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "tight" | "wide";
}

export function Container({
  className,
  size = "tight",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 md:px-10",
        size === "tight" && "max-w-[1120px]",
        size === "wide" && "max-w-[1280px]",
        className
      )}
      {...props}
    />
  );
}
