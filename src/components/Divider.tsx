import React from "react";

export const Divider = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full h-px bg-gray-200 rounded-full ${className}`} />
  );
};

export default Divider;
