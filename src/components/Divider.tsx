import React from "react";

export const Divider = ({ margin }: { margin?: number }) => (
  <div className={`w-full h-px bg-gray-200 rounded-full my-${margin}`} />
);

export default Divider;
