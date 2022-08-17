import React from "react";

export const Divider = ({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div
        className={`relative flex justify-center h-14 items-center ${className}`}
      >
        {label && (
          <span className="px-2 bg-white text-sm text-gray-500">{label}</span>
        )}
      </div>
    </div>
  );
};

export default Divider;
