import { Link } from "react-router-dom"; // ✅ add this
import { cn } from "@/lib/utils"

const hoverEffect = "hover:bg-topbarBorder hover:text-white";
const types = {
  type1: cn("h-14 px-2 text-topbarBorder", hoverEffect),
  type2: "h-14 px-2 bg-topbarBorder text-white",
  type3: "h-12 w-100 rounded-3xl bg-topbarBorder text-white m-4 shadow-[0px_5px_10px_rgba(0,0,0,0.6)]",
};

function Button({ className, type, children, href, ...props }) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-md text-topbarBorder font-sans text-2xl font-bold hover:shadow-[0px_5px_10px_rgba(0,0,0,0.6)] active:scale-95 transition-all duration-150",
    types[type || "type2"],
    className
  );

  if (href) {
    return (
      <Link to={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  // Otherwise render normal button
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}


export default Button;
