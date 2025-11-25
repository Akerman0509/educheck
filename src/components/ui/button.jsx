import * as React from "react"

import { cn } from "@/lib/utils"


const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

function Button({
  className,
  size,
  children,
  ...props
}) {

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors",
        sizes[size || "md"],
        className
      )}
      {...props}
    >
    {children}
      </button>
  );
}

export default Button;
