import clsx from "clsx";

export default function GradientText({ as: Tag = "span", className = "", children }) {
  return <Tag className={clsx("gradient-text gradient-text-animated", className)}>{children}</Tag>;
}
