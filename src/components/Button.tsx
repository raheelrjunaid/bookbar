import classNames from "classnames";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "subtle";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  compact?: boolean;
  size?: "sm" | "base" | "lg";
  className?: string;
  [key: string]: any;
}

export const Button = ({
  children,
  variant = "primary",
  leftIcon,
  rightIcon,
  compact = false,
  size = "base",
  className,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    className={classNames({
      "font-medium py-2 px-4 flex gap-2 items-center": true,
      "bg-purple-600 text-white": variant === "primary",
      "text-gray-800 border border-gray-800": variant === "outline",
      "text-gray-700": variant === "subtle",
      ["text-" + size]: size !== "base",
      "py-3 px-5": size === "lg",
      "py-1 px-2": compact || size === "sm",
      className: true,
    })}
  >
    {leftIcon}
    {children}
    {rightIcon}
  </button>
);

export default Button;
