import { cn } from "@/lib/utils";

export function DotLoader({ className, size = "md" }) {
  const sizes = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-3 w-3" };
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn("rounded-full bg-current animate-bounce", sizes[size])}
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}
