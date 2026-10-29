import * as React from "react";

import { cn } from "../../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground placeholder:text-xs sm:placeholder:text-sm focus-visible:border-gray-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-600 sm:text-sm dark:bg-input/30 dark:focus-visible:border-white",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
