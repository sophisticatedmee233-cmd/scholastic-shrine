import { cn } from "@/lib/utils";

export function Crest({ size = "sm", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dims = { sm: "size-9 text-sm", md: "size-12 text-lg", lg: "size-16 text-2xl" }[size];
  return (
    <div className={cn("grid shrink-0 place-items-center rounded-full bg-brand font-display font-bold text-cream", dims, className)}>
      DP
    </div>
  );
}
