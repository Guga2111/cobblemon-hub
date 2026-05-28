import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "~/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  indicatorStyle?: React.CSSProperties;
}

export function Progress({
  className,
  value,
  indicatorClassName,
  indicatorStyle,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-zinc-800/80",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 bg-primary transition-transform duration-700 ease-out",
          indicatorClassName
        )}
        style={{
          transform: `translateX(-${100 - (value ?? 0)}%)`,
          ...indicatorStyle,
        }}
      />
    </ProgressPrimitive.Root>
  );
}
