import { cn } from "@/lib/format";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
  /** Narrower readable measure for text-heavy blocks */
  narrow?: boolean;
};

export function Container({
  children,
  className,
  as: Tag = "div",
  narrow = false,
}: Props) {
  return (
    <Tag
      className={cn(
        narrow ? "jt-container-narrow" : "jt-container",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
