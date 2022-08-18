import React, { cloneElement, ReactElement } from "react";
import { Oval } from "react-loader-spinner";
import classnames from "classnames";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "subtle";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  compact?: boolean;
  size?: "sm" | "base" | "lg";
  className?: string;
  loading?: boolean;
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
  loading,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    className={classnames(
      "font-medium py-2 px-4 flex gap-2 items-center justify-center",
      variant === "primary" && "bg-purple-600 text-white",
      variant === "outline" && "text-gray-800 border border-gray-800",
      props.disabled && "cursor-not-allowed opacity-60 saturate-0",
      loading && "cursor-not-allowed opacity-60",
      size === "lg" && "py-3 px-5 text-lg",
      size === "sm" && "text-sm",
      (compact || size === "sm") && "py-1 px-2",
      className
    )}
  >
    {leftIcon &&
      cloneElement(leftIcon as ReactElement, {
        size: size === "sm" ? 20 : 22,
      })}
    {children}
    {loading ? (
      <Oval
        height={size === "lg" ? 22 : 20}
        width={size === "lg" ? 22 : 20}
        color="#fff"
        secondaryColor="#eee"
        ariaLabel="oval-loading"
        strokeWidth={6}
      />
    ) : (
      rightIcon &&
      cloneElement(rightIcon as ReactElement, {
        size: size === "sm" ? 20 : 22,
      })
    )}
  </button>
);

export default Button;
