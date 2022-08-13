import React, { cloneElement, ReactElement } from "react";

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
    className={`
        ${"font-medium py-2 px-4 flex gap-2 items-center"}
        ${variant === "primary" && "bg-purple-600 text-white"}
        ${variant === "outline" && "text-gray-800 border border-gray-800"}
        ${size === "lg" ? "py-3 px-5 text-lg" : "text-sm"}
        ${compact || (size === "sm" && "py-1 px-2")}
        ${className}
    `}
  >
    {leftIcon &&
      cloneElement(leftIcon as ReactElement, { size: size === "sm" ? 20 : 22 })}
    {children}
    {rightIcon &&
      cloneElement(rightIcon as ReactElement, {
        size: size === "sm" ? 20 : 22,
      })}
  </button>
);

export default Button;
